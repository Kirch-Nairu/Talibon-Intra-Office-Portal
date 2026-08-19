<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionWorkflowService
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly PlatformNotificationService $notifications,
        private readonly CalendarService $calendar,
    ) {
    }

    public function create(User $actor, array $data): WorkflowTransaction
    {
        $originDepartmentId = $actor->employee?->department_id;

        if (! $originDepartmentId || ! Department::query()->activeRoutable()->whereKey($originDepartmentId)->exists()) {
            throw ValidationException::withMessages(['department' => 'An active routable employee office is required.']);
        }

        if ((int) $data['target_department_id'] === (int) $originDepartmentId) {
            throw ValidationException::withMessages(['target_department_id' => 'Select a different receiving office.']);
        }

        $targetDepartment = Department::query()
            ->activeRoutable()
            ->whereKey((int) $data['target_department_id'])
            ->first();

        if (! $targetDepartment) {
            throw ValidationException::withMessages(['target_department_id' => 'Select an active routable receiving office.']);
        }

        return DB::transaction(function () use ($actor, $data, $originDepartmentId, $targetDepartment): WorkflowTransaction {
            $dueAt = isset($data['due_at']) && $data['due_at']
                ? Carbon::parse($data['due_at'])->endOfDay()
                : now()->addDays(match ($data['priority']) {
                    'urgent' => 1,
                    'high' => 3,
                    default => 5,
                })->endOfDay();

            $transaction = WorkflowTransaction::query()->create([
                'transaction_type' => $data['transaction_type'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'priority' => $data['priority'],
                'origin_department_id' => $originDepartmentId,
                'current_department_id' => $targetDepartment->id,
                'created_by_user_id' => $actor->id,
                'status' => 'submitted',
                'received_at' => now(),
                'due_at' => $dueAt,
            ]);

            $transaction->update([
                'reference_no' => sprintf('TAL-%s-%06d', now()->format('Y'), $transaction->id),
            ]);

            $event = TransactionEvent::query()->create([
                'transaction_id' => $transaction->id,
                'actor_user_id' => $actor->id,
                'from_department_id' => $originDepartmentId,
                'to_department_id' => $targetDepartment->id,
                'action' => 'submitted',
                'previous_status' => 'draft',
                'new_status' => 'submitted',
                'remarks' => $data['remarks'] ?? null,
                'created_at' => now(),
            ]);

            $this->audit->record(
                $actor,
                'transaction.created',
                "Created and routed {$transaction->reference_no}.",
                'allowed',
                WorkflowTransaction::class,
                $transaction->id,
            );

            $this->notifications->notifyDepartment($targetDepartment, [
                'event_key' => 'transaction-event-'.$event->id,
                'source_domain' => 'transaction',
                'source_type' => WorkflowTransaction::class,
                'source_id' => $transaction->id,
                'priority' => $this->notificationPriority($transaction->priority),
                'title' => $targetDepartment->code === 'MAYOR' ? 'Executive action required' : 'New transaction received',
                'message' => $transaction->reference_no.' · '.$transaction->title,
                'action_url' => '/transactions/'.$transaction->id,
            ]);
            $this->calendar->syncTransactionDue($transaction);

            return $transaction->fresh(['originDepartment', 'currentDepartment', 'creator', 'assignedEmployee']);
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
        return DB::transaction(function () use ($actor, $transaction, $action, $targetDepartmentId, $assignedEmployeeId, $remarks): WorkflowTransaction {
            $locked = WorkflowTransaction::query()->lockForUpdate()->findOrFail($transaction->id);
            $locked->loadMissing('currentDepartment');

            if (in_array($locked->status, ['approved', 'disapproved', 'closed'], true)) {
                throw ValidationException::withMessages(['action' => 'This transaction is already in a terminal state.']);
            }

            $previousStatus = $locked->status;
            $fromDepartmentId = $locked->current_department_id;
            $toDepartmentId = $fromDepartmentId;
            $newStatus = $previousStatus;
            $assignment = $locked->assigned_employee_id;
            $receivedAt = $locked->received_at;
            $completedAt = $locked->completed_at;
            $eventRemarks = $remarks;

            switch ($action) {
                case 'assign':
                    if (! $assignedEmployeeId) {
                        throw ValidationException::withMessages(['assigned_employee_id' => 'Choose an employee from the current office.']);
                    }
                    $employee = Employee::query()
                        ->whereKey($assignedEmployeeId)
                        ->where('department_id', $fromDepartmentId)
                        ->where('employment_status', 'active')
                        ->firstOrFail();
                    $assignment = $employee->id;
                    $eventRemarks = trim(($remarks ? $remarks.' ' : '')."Assigned to {$employee->full_name}.");
                    break;

                case 'mark_review':
                    $newStatus = 'for_review';
                    break;

                case 'forward':
                    if (! $targetDepartmentId || $targetDepartmentId === $fromDepartmentId) {
                        throw ValidationException::withMessages(['target_department_id' => 'Choose a different receiving office.']);
                    }

                    if (! Department::query()->activeRoutable()->whereKey($targetDepartmentId)->exists()) {
                        throw ValidationException::withMessages(['target_department_id' => 'Choose an active routable receiving office.']);
                    }

                    $toDepartmentId = $targetDepartmentId;
                    $newStatus = 'submitted';
                    $assignment = null;
                    $receivedAt = now();
                    break;

                case 'send_to_mayor':
                    $mayor = Department::query()->activeRoutable()->where('code', 'MAYOR')->firstOrFail();
                    $toDepartmentId = $mayor->id;
                    $newStatus = 'for_approval';
                    $assignment = null;
                    $receivedAt = now();
                    break;

                case 'return_origin':
                    $toDepartmentId = $locked->origin_department_id;
                    $newStatus = 'returned';
                    $assignment = null;
                    $receivedAt = now();
                    break;

                case 'request_information':
                    $toDepartmentId = $locked->origin_department_id;
                    $newStatus = 'information_requested';
                    $assignment = null;
                    $receivedAt = now();
                    break;

                case 'approve':
                    $newStatus = 'approved';
                    $completedAt = now();
                    break;

                case 'disapprove':
                    $newStatus = 'disapproved';
                    $completedAt = now();
                    break;

                default:
                    throw ValidationException::withMessages(['action' => 'Unsupported workflow action.']);
            }

            $locked->update([
                'current_department_id' => $toDepartmentId,
                'assigned_employee_id' => $assignment,
                'status' => $newStatus,
                'received_at' => $receivedAt,
                'completed_at' => $completedAt,
            ]);

            $event = TransactionEvent::query()->create([
                'transaction_id' => $locked->id,
                'actor_user_id' => $actor->id,
                'from_department_id' => $fromDepartmentId,
                'to_department_id' => $toDepartmentId,
                'action' => $action,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'remarks' => $eventRemarks,
                'created_at' => now(),
            ]);

            $this->audit->record(
                $actor,
                "transaction.{$action}",
                sprintf('%s changed from %s to %s.', $locked->reference_no, $previousStatus, $newStatus),
                'allowed',
                WorkflowTransaction::class,
                $locked->id,
            );

            if ($action === 'assign' && $assignment) {
                $assigned = Employee::query()->with('user')->find($assignment);
                if ($assigned?->user) {
                    $this->notifications->notifyUser($assigned->user, [
                        'event_key' => 'transaction-event-'.$event->id,
                        'department_id' => $toDepartmentId,
                        'source_domain' => 'transaction',
                        'source_type' => WorkflowTransaction::class,
                        'source_id' => $locked->id,
                        'priority' => 'action_required',
                        'title' => 'Work assigned to you',
                        'message' => $locked->reference_no.' · '.$locked->title,
                        'action_url' => '/transactions/'.$locked->id,
                    ]);
                }
            } elseif (in_array($action, ['forward', 'send_to_mayor', 'return_origin', 'request_information'], true)) {
                $recipientOffice = Department::query()->activeRoutable()->find($toDepartmentId);
                if ($recipientOffice) {
                    $this->notifications->notifyDepartment($recipientOffice, [
                        'event_key' => 'transaction-event-'.$event->id,
                        'source_domain' => 'transaction',
                        'source_type' => WorkflowTransaction::class,
                        'source_id' => $locked->id,
                        'priority' => $this->notificationPriority($locked->priority),
                        'title' => $recipientOffice->code === 'MAYOR' ? 'Executive action required' : 'Transaction routed to your office',
                        'message' => $locked->reference_no.' · '.$locked->title,
                        'action_url' => '/transactions/'.$locked->id,
                    ]);
                }
            } elseif (in_array($action, ['approve', 'disapprove'], true)) {
                $originOffice = Department::query()->activeRoutable()->find($locked->origin_department_id);
                if ($originOffice) {
                    $this->notifications->notifyDepartment($originOffice, [
                        'event_key' => 'transaction-event-'.$event->id,
                        'source_domain' => 'transaction',
                        'source_type' => WorkflowTransaction::class,
                        'source_id' => $locked->id,
                        'priority' => 'action_required',
                        'title' => $action === 'approve' ? 'Transaction approved' : 'Transaction disapproved',
                        'message' => $locked->reference_no.' · '.$locked->title,
                        'action_url' => '/transactions/'.$locked->id,
                    ]);
                }
            }

            $this->calendar->syncTransactionDue($locked);

            return $locked->fresh(['originDepartment', 'currentDepartment', 'creator', 'assignedEmployee']);
        });
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
