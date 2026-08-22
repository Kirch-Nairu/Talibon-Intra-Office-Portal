<?php

namespace App\Services;

use App\Domain\Workflow\SlaResolver;
use App\Domain\Workflow\WorkflowDefinitionResolver;
use App\Domain\Workflow\WorkflowDestinationResolver;
use App\Domain\Workflow\WorkflowTransitionRule;
use App\Models\Department;
use App\Models\Employee;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionWorkflowService
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly PlatformNotificationService $notifications,
        private readonly CalendarService $calendar,
        private readonly WorkflowDefinitionResolver $definitions,
        private readonly WorkflowDestinationResolver $destinations,
        private readonly SlaResolver $sla,
    ) {
    }

    public function create(User $actor, array $data): WorkflowTransaction
    {
        $originDepartmentId = $actor->employee?->department_id;

        if (! $originDepartmentId || ! Department::query()->activeRoutable()->whereKey($originDepartmentId)->exists()) {
            throw ValidationException::withMessages(['department' => 'An active routable employee office is required.']);
        }

        $targetDepartment = $this->receivingDepartment(
            (int) $data['target_department_id'],
            (int) $originDepartmentId,
        );

        return DB::transaction(function () use ($actor, $data, $originDepartmentId, $targetDepartment): WorkflowTransaction {
            $definition = $this->definitions->resolve($data['transaction_type']);

            $transaction = WorkflowTransaction::query()->create([
                'transaction_type' => $data['transaction_type'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'priority' => $data['priority'],
                'origin_department_id' => $originDepartmentId,
                'current_department_id' => $targetDepartment->id,
                'created_by_user_id' => $actor->id,
                'status' => $definition->initialStatus(),
                'received_at' => now(),
                'due_at' => $this->sla->resolve($data['priority'], $data['due_at'] ?? null),
            ]);

            $transaction->update([
                'reference_no' => sprintf('TAL-%s-%06d', now()->format('Y'), $transaction->id),
            ]);

            $event = $this->recordEvent(
                transaction: $transaction,
                actor: $actor,
                action: 'submitted',
                previousStatus: 'draft',
                newStatus: $definition->initialStatus(),
                fromDepartmentId: (int) $originDepartmentId,
                toDepartmentId: (int) $targetDepartment->id,
                remarks: $data['remarks'] ?? null,
            );

            $this->audit->record(
                $actor,
                'transaction.created',
                "Created and routed {$transaction->reference_no}.",
                'allowed',
                WorkflowTransaction::class,
                $transaction->id,
            );

            $this->notifyOffice($targetDepartment, $transaction, $event, true);
            $this->calendar->syncTransactionDue($transaction);

            return $this->freshTransaction($transaction);
        });
    }

    public function transition(
        User $actor,
        WorkflowTransaction $transaction,
        string $action,
        ?int $targetDepartmentId = null,
        ?int $assignedEmployeeId = null,
        ?string $remarks = null,
    ): WorkflowTransaction {
        return DB::transaction(function () use (
            $actor,
            $transaction,
            $action,
            $targetDepartmentId,
            $assignedEmployeeId,
            $remarks,
        ): WorkflowTransaction {
            $locked = WorkflowTransaction::query()->lockForUpdate()->findOrFail($transaction->id);
            $definition = $this->definitions->resolve($locked);

            if ($definition->isTerminal($locked->status)) {
                throw ValidationException::withMessages(['action' => 'This transaction is already in a terminal state.']);
            }

            $rule = $definition->transition($action);
            $previousStatus = $locked->status;
            $fromDepartmentId = (int) $locked->current_department_id;
            $toDepartmentId = $this->destinations->resolve($rule, $locked, $targetDepartmentId);
            $assignment = $this->resolveAssignment($rule, $fromDepartmentId, $assignedEmployeeId, $locked->assigned_employee_id);
            $newStatus = $rule->status ?? $previousStatus;
            $eventRemarks = $this->eventRemarks($rule, $assignment, $remarks);

            $locked->update([
                'current_department_id' => $toDepartmentId,
                'assigned_employee_id' => $assignment,
                'status' => $newStatus,
                'received_at' => $rule->refreshReceivedAt ? now() : $locked->received_at,
                'completed_at' => $rule->completes ? now() : $locked->completed_at,
            ]);

            $event = $this->recordEvent(
                transaction: $locked,
                actor: $actor,
                action: $action,
                previousStatus: $previousStatus,
                newStatus: $newStatus,
                fromDepartmentId: $fromDepartmentId,
                toDepartmentId: $toDepartmentId,
                remarks: $eventRemarks,
            );

            $this->audit->record(
                $actor,
                "transaction.{$action}",
                sprintf('%s changed from %s to %s.', $locked->reference_no, $previousStatus, $newStatus),
                'allowed',
                WorkflowTransaction::class,
                $locked->id,
            );

            $this->dispatchTransitionNotification($rule, $locked, $event, $assignment, $action);
            $this->calendar->syncTransactionDue($locked);

            return $this->freshTransaction($locked);
        });
    }

    private function receivingDepartment(int $targetDepartmentId, int $originDepartmentId): Department
    {
        if ($targetDepartmentId === $originDepartmentId) {
            throw ValidationException::withMessages([
                'target_department_id' => 'Select a different receiving office.',
            ]);
        }

        $targetDepartment = Department::query()
            ->activeRoutable()
            ->whereKey($targetDepartmentId)
            ->first();

        if (! $targetDepartment) {
            throw ValidationException::withMessages([
                'target_department_id' => 'Select an active routable receiving office.',
            ]);
        }

        return $targetDepartment;
    }

    private function resolveAssignment(
        WorkflowTransitionRule $rule,
        int $departmentId,
        ?int $assignedEmployeeId,
        ?int $currentAssignmentId,
    ): ?int {
        if ($rule->requiresAssignment) {
            if (! $assignedEmployeeId) {
                throw ValidationException::withMessages([
                    'assigned_employee_id' => 'Choose an employee from the current office.',
                ]);
            }

            return Employee::query()
                ->whereKey($assignedEmployeeId)
                ->where('department_id', $departmentId)
                ->where('employment_status', 'active')
                ->firstOrFail()
                ->id;
        }

        return $rule->clearAssignment ? null : $currentAssignmentId;
    }

    private function eventRemarks(
        WorkflowTransitionRule $rule,
        ?int $assignmentId,
        ?string $remarks,
    ): ?string {
        if (! $rule->requiresAssignment || ! $assignmentId) {
            return $remarks;
        }

        $employee = Employee::query()->findOrFail($assignmentId);

        return trim(($remarks ? $remarks.' ' : '')."Assigned to {$employee->full_name}.");
    }

    private function recordEvent(
        WorkflowTransaction $transaction,
        User $actor,
        string $action,
        string $previousStatus,
        string $newStatus,
        int $fromDepartmentId,
        int $toDepartmentId,
        ?string $remarks,
    ): TransactionEvent {
        return TransactionEvent::query()->create([
            'transaction_id' => $transaction->id,
            'actor_user_id' => $actor->id,
            'from_department_id' => $fromDepartmentId,
            'to_department_id' => $toDepartmentId,
            'action' => $action,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'remarks' => $remarks,
            'created_at' => now(),
        ]);
    }

    private function dispatchTransitionNotification(
        WorkflowTransitionRule $rule,
        WorkflowTransaction $transaction,
        TransactionEvent $event,
        ?int $assignmentId,
        string $action,
    ): void {
        if ($rule->requiresAssignment && $assignmentId) {
            $this->notifyAssignedEmployee($transaction, $event, $assignmentId);

            return;
        }

        if ($rule->refreshReceivedAt) {
            $office = Department::query()->activeRoutable()->find($transaction->current_department_id);

            if ($office) {
                $this->notifyOffice($office, $transaction, $event);
            }

            return;
        }

        if ($rule->completes) {
            $this->notifyOriginDecision($transaction, $event, $action);
        }
    }

    private function notifyAssignedEmployee(
        WorkflowTransaction $transaction,
        TransactionEvent $event,
        int $assignmentId,
    ): void {
        $assigned = Employee::query()->with('user')->find($assignmentId);

        if (! $assigned?->user) {
            return;
        }

        $this->notifications->notifyUser($assigned->user, [
            'event_key' => 'transaction-event-'.$event->id,
            'department_id' => $transaction->current_department_id,
            'source_domain' => 'transaction',
            'source_type' => WorkflowTransaction::class,
            'source_id' => $transaction->id,
            'priority' => 'action_required',
            'title' => 'Work assigned to you',
            'message' => $transaction->reference_no.' · '.$transaction->title,
            'action_url' => '/transactions/'.$transaction->id,
        ]);
    }

    private function notifyOffice(
        Department $office,
        WorkflowTransaction $transaction,
        TransactionEvent $event,
        bool $initialReceipt = false,
    ): void {
        $this->notifications->notifyDepartment($office, [
            'event_key' => 'transaction-event-'.$event->id,
            'source_domain' => 'transaction',
            'source_type' => WorkflowTransaction::class,
            'source_id' => $transaction->id,
            'priority' => $this->notificationPriority($transaction->priority),
            'title' => $this->officeNotificationTitle($office, $initialReceipt),
            'message' => $transaction->reference_no.' · '.$transaction->title,
            'action_url' => '/transactions/'.$transaction->id,
        ]);
    }

    private function notifyOriginDecision(
        WorkflowTransaction $transaction,
        TransactionEvent $event,
        string $action,
    ): void {
        $originOffice = Department::query()->activeRoutable()->find($transaction->origin_department_id);

        if (! $originOffice) {
            return;
        }

        $title = match ($action) {
            'approve' => 'Transaction approved',
            'disapprove' => 'Transaction disapproved',
            default => 'Transaction completed',
        };

        $this->notifications->notifyDepartment($originOffice, [
            'event_key' => 'transaction-event-'.$event->id,
            'source_domain' => 'transaction',
            'source_type' => WorkflowTransaction::class,
            'source_id' => $transaction->id,
            'priority' => 'action_required',
            'title' => $title,
            'message' => $transaction->reference_no.' · '.$transaction->title,
            'action_url' => '/transactions/'.$transaction->id,
        ]);
    }

    private function officeNotificationTitle(Department $office, bool $initialReceipt): string
    {
        $executiveCodes = config('workflow.executive_attention_office_codes', []);

        if (in_array($office->code, $executiveCodes, true)) {
            return 'Executive action required';
        }

        return $initialReceipt
            ? 'New transaction received'
            : 'Transaction routed to your office';
    }

    private function freshTransaction(WorkflowTransaction $transaction): WorkflowTransaction
    {
        return $transaction->fresh([
            'originDepartment',
            'currentDepartment',
            'creator',
            'assignedEmployee',
        ]);
    }

    private function notificationPriority(string $priority): string
    {
        return match ($priority) {
            'urgent' => 'urgent',
            'high' => 'action_required',
            default => 'info',
        };
    }
}
