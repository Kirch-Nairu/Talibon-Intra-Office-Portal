<?php

namespace App\Services;

use App\Models\Department;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

final class DashboardTransactionQuery
{
    public function __construct(
        private readonly TransactionVisibilityQuery $visibility,
    ) {
    }

    public function workspace(User $actor): array
    {
        $actor->loadMissing('employee.department');
        $base = $this->visibility->scope($actor);
        $departmentId = (int) $actor->employee->department_id;
        $employeeId = (int) $actor->employee->id;
        $terminal = $this->terminalStatuses();
        $now = now();
        $dueSoonEnd = $now->copy()->addDay();

        $active = fn (): Builder => (clone $base)->whereNotIn('status', $terminal);

        $metrics = [
            'requiresMyAction' => [
                'label' => 'Requires My Action',
                'value' => $active()->where('assigned_employee_id', $employeeId)->count(),
                'link' => '/transactions?view=needs_my_action',
            ],
            'pendingInMyOffice' => [
                'label' => 'Pending in My Office',
                'value' => $active()->where('current_department_id', $departmentId)->count(),
                'link' => '/transactions?view=office_queue',
            ],
            'unassignedInMyOffice' => [
                'label' => 'Unassigned in My Office',
                'value' => $active()
                    ->where('current_department_id', $departmentId)
                    ->whereNull('assigned_employee_id')
                    ->count(),
                'link' => '/transactions?view=unassigned',
            ],
            'overdue' => [
                'label' => 'Overdue',
                'value' => $active()
                    ->whereNotNull('due_at')
                    ->where('due_at', '<', $now)
                    ->count(),
                'link' => '/transactions?view=overdue',
            ],
            'waitingOnOtherOffices' => [
                'label' => 'Waiting on Other Offices',
                'value' => $active()
                    ->where('origin_department_id', $departmentId)
                    ->where('current_department_id', '!=', $departmentId)
                    ->count(),
                'link' => '/transactions?view=waiting_on_others',
            ],
            'dueSoon' => [
                'label' => 'Due Soon',
                'value' => $active()
                    ->whereBetween('due_at', [$now, $dueSoonEnd])
                    ->count(),
                'link' => '/transactions?view=due_soon',
            ],
            'completedThisMonth' => [
                'label' => 'Completed This Month',
                'value' => (clone $base)
                    ->whereIn('status', $terminal)
                    ->whereNotNull('completed_at')
                    ->where('completed_at', '>=', $now->copy()->startOfMonth())
                    ->count(),
                'link' => '/transactions?view=recently_completed',
            ],
        ];

        $recentWork = (clone $base)
            ->with([
                'originDepartment:id,code,name,short_name',
                'currentDepartment:id,code,name,short_name',
                'assignedEmployee:id,full_name,position_title',
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (WorkflowTransaction $transaction): array => $this->mapRecent(
                $transaction,
                $terminal,
                $now,
                $dueSoonEnd,
            ))
            ->all();

        $canSeeMunicipalOverview = $this->visibility->canViewAll($actor);

        return [
            'departmentMetrics' => $metrics,
            'recentWork' => $recentWork,
            'canSeeMunicipalOverview' => $canSeeMunicipalOverview,
            'municipalOverview' => $canSeeMunicipalOverview
                ? $this->municipalOverview($base, $terminal, $now, $dueSoonEnd)
                : null,
            'departmentWorkload' => $canSeeMunicipalOverview
                ? $this->departmentWorkload($base, $terminal, $now, $dueSoonEnd)
                : [],
        ];
    }

    private function municipalOverview(
        Builder $base,
        array $terminal,
        $now,
        $dueSoonEnd,
    ): array {
        $active = fn (): Builder => (clone $base)->whereNotIn('status', $terminal);
        $mayorDepartmentId = Department::query()
            ->where('is_active', true)
            ->where('code', 'MAYOR')
            ->value('id');

        return [
            'activeMunicipalWork' => $active()->count(),
            'municipalOverdue' => $active()
                ->whereNotNull('due_at')
                ->where('due_at', '<', $now)
                ->count(),
            'municipalUnassigned' => $active()->whereNull('assigned_employee_id')->count(),
            'dueSoon' => $active()->whereBetween('due_at', [$now, $dueSoonEnd])->count(),
            'executiveQueue' => $mayorDepartmentId
                ? $active()->where('current_department_id', $mayorDepartmentId)->count()
                : 0,
            'completedThisMonth' => (clone $base)
                ->whereIn('status', $terminal)
                ->whereNotNull('completed_at')
                ->where('completed_at', '>=', $now->copy()->startOfMonth())
                ->count(),
        ];
    }

    private function departmentWorkload(
        Builder $base,
        array $terminal,
        $now,
        $dueSoonEnd,
    ): array {
        $rows = (clone $base)
            ->whereNotIn('status', $terminal)
            ->whereNotNull('current_department_id')
            ->select('current_department_id')
            ->selectRaw('COUNT(*) AS active')
            ->selectRaw('SUM(CASE WHEN assigned_employee_id IS NULL THEN 1 ELSE 0 END) AS unassigned')
            ->selectRaw(
                'SUM(CASE WHEN due_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS due_soon',
                [$now, $dueSoonEnd],
            )
            ->selectRaw(
                'SUM(CASE WHEN due_at IS NOT NULL AND due_at < ? THEN 1 ELSE 0 END) AS overdue',
                [$now],
            )
            ->groupBy('current_department_id')
            ->get();

        $departments = Department::query()
            ->where('is_active', true)
            ->whereIn('id', $rows->pluck('current_department_id')->all())
            ->get(['id', 'code', 'name', 'short_name'])
            ->keyBy('id');

        return $rows
            ->map(function ($row) use ($departments): ?array {
                $department = $departments->get((int) $row->current_department_id);
                if (! $department) {
                    return null;
                }

                return [
                    'id' => (int) $department->id,
                    'code' => $department->code,
                    'name' => $department->name,
                    'shortName' => $department->short_name,
                    'active' => (int) $row->active,
                    'unassigned' => (int) $row->unassigned,
                    'dueSoon' => (int) $row->due_soon,
                    'overdue' => (int) $row->overdue,
                ];
            })
            ->filter()
            ->sortByDesc(fn (array $office): int =>
                ($office['overdue'] * 1000)
                + ($office['dueSoon'] * 100)
                + ($office['unassigned'] * 10)
                + $office['active']
            )
            ->values()
            ->all();
    }

    private function mapRecent(
        WorkflowTransaction $transaction,
        array $terminal,
        $now,
        $dueSoonEnd,
    ): array {
        $dueState = 'on_track';

        if (in_array($transaction->status, $terminal, true)) {
            $dueState = 'completed';
        } elseif ($transaction->due_at?->lt($now)) {
            $dueState = 'overdue';
        } elseif ($transaction->due_at?->gte($now) && $transaction->due_at?->lte($dueSoonEnd)) {
            $dueState = 'due_soon';
        }

        return [
            'reference' => $transaction->reference_no,
            'title' => $transaction->title,
            'transactionType' => Str::headline($transaction->transaction_type),
            'status' => $transaction->status,
            'priority' => $transaction->priority,
            'originOffice' => $this->office($transaction->originDepartment),
            'currentOffice' => $this->office($transaction->currentDepartment),
            'assignedEmployee' => $transaction->assignedEmployee ? [
                'name' => $transaction->assignedEmployee->full_name,
                'position' => $transaction->assignedEmployee->position_title,
            ] : null,
            'dueState' => $dueState,
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

    /** @return array<int, string> */
    private function terminalStatuses(): array
    {
        return array_values(config('workflow.default.terminal_statuses', [
            'approved',
            'disapproved',
            'closed',
        ]));
    }
}
