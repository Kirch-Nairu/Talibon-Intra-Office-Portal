<?php

namespace App\Services;

use App\Models\Department;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionWorkflowService
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function create(User $actor, array $data): WorkflowTransaction
    {
        $originDepartmentId = $actor->employee?->department_id;

        if (! $originDepartmentId) {
            throw ValidationException::withMessages(['department' => 'An active employee department is required.']);
        }

        if ((int) $data['target_department_id'] === (int) $originDepartmentId) {
            throw ValidationException::withMessages(['target_department_id' => 'Select a different receiving department.']);
        }

        return DB::transaction(function () use ($actor, $data, $originDepartmentId): WorkflowTransaction {
            $transaction = WorkflowTransaction::query()->create([
                'transaction_type' => $data['transaction_type'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'priority' => $data['priority'],
                'origin_department_id' => $originDepartmentId,
                'current_department_id' => $data['target_department_id'],
                'created_by_user_id' => $actor->id,
                'status' => 'submitted',
            ]);

            $transaction->update([
                'reference_no' => sprintf('TAL-%s-%06d', now()->format('Y'), $transaction->id),
            ]);

            TransactionEvent::query()->create([
                'transaction_id' => $transaction->id,
                'actor_user_id' => $actor->id,
                'from_department_id' => $originDepartmentId,
                'to_department_id' => $data['target_department_id'],
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

            return $transaction->fresh(['originDepartment', 'currentDepartment', 'creator']);
        });
    }

    public function transition(User $actor, WorkflowTransaction $transaction, string $action, ?int $targetDepartmentId = null, ?string $remarks = null): WorkflowTransaction
    {
        return DB::transaction(function () use ($actor, $transaction, $action, $targetDepartmentId, $remarks): WorkflowTransaction {
            $locked = WorkflowTransaction::query()->lockForUpdate()->findOrFail($transaction->id);
            $locked->loadMissing('currentDepartment');

            if (in_array($locked->status, ['approved', 'disapproved', 'closed'], true)) {
                throw ValidationException::withMessages(['action' => 'This transaction is already in a terminal state.']);
            }

            $previousStatus = $locked->status;
            $fromDepartmentId = $locked->current_department_id;
            $toDepartmentId = $fromDepartmentId;
            $newStatus = $previousStatus;

            switch ($action) {
                case 'mark_review':
                    $newStatus = 'for_review';
                    break;
                case 'forward':
                    if (! $targetDepartmentId || $targetDepartmentId === $fromDepartmentId) {
                        throw ValidationException::withMessages(['target_department_id' => 'Choose a different receiving department.']);
                    }
                    Department::query()->whereKey($targetDepartmentId)->where('is_active', true)->firstOrFail();
                    $toDepartmentId = $targetDepartmentId;
                    $newStatus = 'submitted';
                    break;
                case 'send_to_mayor':
                    $mayor = Department::query()->where('code', 'MAYOR')->where('is_active', true)->firstOrFail();
                    $toDepartmentId = $mayor->id;
                    $newStatus = 'for_approval';
                    break;
                case 'return_origin':
                    $toDepartmentId = $locked->origin_department_id;
                    $newStatus = 'returned';
                    break;
                case 'request_information':
                    $toDepartmentId = $locked->origin_department_id;
                    $newStatus = 'information_requested';
                    break;
                case 'approve':
                    $newStatus = 'approved';
                    break;
                case 'disapprove':
                    $newStatus = 'disapproved';
                    break;
                default:
                    throw ValidationException::withMessages(['action' => 'Unsupported workflow action.']);
            }

            $locked->update([
                'current_department_id' => $toDepartmentId,
                'status' => $newStatus,
            ]);

            TransactionEvent::query()->create([
                'transaction_id' => $locked->id,
                'actor_user_id' => $actor->id,
                'from_department_id' => $fromDepartmentId,
                'to_department_id' => $toDepartmentId,
                'action' => $action,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'remarks' => $remarks,
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

            return $locked->fresh(['originDepartment', 'currentDepartment', 'creator']);
        });
    }
}
