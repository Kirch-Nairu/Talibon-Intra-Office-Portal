<?php

namespace App\Services;

use App\Models\CorrespondenceRecord;
use App\Models\Department;
use App\Models\Employee;
use App\Models\WorkflowTransaction;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

final class RecordsResultPresenter
{
    public function hydratePage(LengthAwarePaginator $paginator): LengthAwarePaginator
    {
        $rows = $paginator->getCollection();
        $correspondenceKeys = $rows->where('record_type', 'correspondence')->pluck('record_key')->all();
        $transactionIds = $rows->where('record_type', 'transaction')
            ->pluck('record_key')
            ->map(fn ($id): int => (int) $id)
            ->all();

        $correspondence = $this->correspondence($correspondenceKeys);
        $transactions = $this->transactions($transactionIds);

        $paginator->setCollection($rows->map(function (object $row) use ($correspondence, $transactions): array {
            if ($row->record_type === 'correspondence') {
                return $this->mapCorrespondence($correspondence->get((string) $row->record_key));
            }

            return $this->mapTransaction($transactions->get((int) $row->record_key));
        }));

        return $paginator;
    }

    /** @param array<int, string> $keys */
    private function correspondence(array $keys): Collection
    {
        if ($keys === []) {
            return collect();
        }

        return CorrespondenceRecord::query()
            ->whereIn('public_id', $keys)
            ->with([
                'receivingDepartment:id,code,name,short_name',
                'workflowTransaction:id,current_department_id,assigned_employee_id',
                'workflowTransaction.currentDepartment:id,code,name,short_name',
                'workflowTransaction.assignedEmployee:id,full_name,position_title',
            ])
            ->get()
            ->keyBy('public_id');
    }

    /** @param array<int, int> $ids */
    private function transactions(array $ids): Collection
    {
        if ($ids === []) {
            return collect();
        }

        return WorkflowTransaction::query()
            ->whereIn('id', $ids)
            ->with([
                'originDepartment:id,code,name,short_name',
                'currentDepartment:id,code,name,short_name',
                'assignedEmployee:id,full_name,position_title',
            ])
            ->get()
            ->keyBy('id');
    }

    private function mapCorrespondence(?CorrespondenceRecord $record): array
    {
        if (! $record) {
            return [];
        }

        $workflow = $record->workflowTransaction;
        $currentOffice = $workflow?->currentDepartment ?? $record->receivingDepartment;
        $sender = array_values(array_filter([
            $record->sender_name,
            $record->sender_organization,
            $record->source ? Str::headline($record->source) : null,
        ]));

        return [
            'recordType' => 'correspondence',
            'reference' => $record->municipal_reference_no ?? $record->external_reference_no,
            'title' => $record->subject,
            'source' => implode(' · ', $sender),
            'originOffice' => null,
            'currentOffice' => $this->office($currentOffice),
            'assignedEmployee' => $this->employee($workflow?->assignedEmployee),
            'state' => $record->lifecycle_state->value,
            'classification' => $record->classification?->value,
            'recordDate' => $record->received_at?->toIso8601String(),
            'updatedAt' => $record->updated_at?->toIso8601String(),
            'detailUrl' => route('correspondence.workspace.show', $record, false),
        ];
    }

    private function mapTransaction(?WorkflowTransaction $transaction): array
    {
        if (! $transaction) {
            return [];
        }

        return [
            'recordType' => 'transaction',
            'reference' => $transaction->reference_no,
            'title' => $transaction->title,
            'source' => Str::headline($transaction->transaction_type),
            'originOffice' => $this->office($transaction->originDepartment),
            'currentOffice' => $this->office($transaction->currentDepartment),
            'assignedEmployee' => $this->employee($transaction->assignedEmployee),
            'state' => $transaction->status,
            'classification' => null,
            'recordDate' => ($transaction->received_at ?? $transaction->created_at)?->toIso8601String(),
            'updatedAt' => $transaction->updated_at?->toIso8601String(),
            'detailUrl' => route('transactions.show', $transaction, false),
        ];
    }

    private function office(?Department $department): ?array
    {
        return $department ? [
            'code' => $department->code,
            'name' => $department->name,
            'shortName' => $department->short_name,
        ] : null;
    }

    private function employee(?Employee $employee): ?array
    {
        return $employee ? [
            'name' => $employee->full_name,
            'position' => $employee->position_title,
        ] : null;
    }
}
