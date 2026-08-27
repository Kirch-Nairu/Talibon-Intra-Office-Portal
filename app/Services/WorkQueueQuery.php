<?php

namespace App\Services;

use App\Http\Requests\TransactionIndexRequest;
use App\Models\Department;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

final class WorkQueueQuery
{
    private const VIEW_LABELS = [
        'all' => 'All',
        'needs_my_action' => 'Needs My Action',
        'assigned_to_me' => 'Assigned to Me',
        'office_queue' => 'Office Queue',
        'unassigned' => 'Unassigned',
        'overdue' => 'Overdue',
        'due_soon' => 'Due Soon',
        'recently_updated' => 'Recently Updated',
        'waiting_on_others' => 'Waiting on Others',
        'recently_completed' => 'Recently Completed',
    ];

    public function __construct(
        private readonly TransactionVisibilityQuery $visibility,
    ) {}

    /** @param array<string, mixed> $filters */
    public function workspace(User $actor, array $filters): array
    {
        $actor->loadMissing('employee.department');
        $view = (string) ($filters['view'] ?? 'all');

        $authorized = $this->visibility->scope($actor);
        $filtered = $this->applyCommonFilters(clone $authorized, $filters);
        $views = $this->viewOptions($filtered, $actor);
        $records = $this->records($filtered, $actor, $view);

        return [
            'records' => $records,
            'filters' => [
                'view' => $view,
                'search' => (string) ($filters['search'] ?? ''),
                'status' => (string) ($filters['status'] ?? ''),
                'priority' => (string) ($filters['priority'] ?? ''),
                'office_id' => isset($filters['office_id']) ? (int) $filters['office_id'] : null,
            ],
            'views' => $views,
            'filterOptions' => [
                'statuses' => $this->statusOptions($authorized),
                'priorities' => ['normal', 'high', 'urgent'],
                'offices' => $this->officeOptions($authorized, $actor),
            ],
            'workspace' => [
                'departmentName' => $actor->employee?->department?->name,
                'departmentCode' => $actor->employee?->department?->code,
                'canViewAll' => $this->visibility->canViewAll($actor),
            ],
        ];
    }

    /** @param array<string, mixed> $filters */
    private function applyCommonFilters(Builder $query, array $filters): Builder
    {
        $search = Str::lower(trim((string) ($filters['search'] ?? '')));
        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function (Builder $match) use ($like): void {
                $match->whereRaw('LOWER(reference_no) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(title) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(transaction_type) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(COALESCE(description, \'\')) LIKE ?', [$like])
                    ->orWhereHas('originDepartment', fn (Builder $office) => $office->whereRaw('LOWER(name) LIKE ?', [$like]))
                    ->orWhereHas('currentDepartment', fn (Builder $office) => $office->whereRaw('LOWER(name) LIKE ?', [$like]))
                    ->orWhereHas('assignedEmployee', fn (Builder $employee) => $employee->whereRaw('LOWER(full_name) LIKE ?', [$like]));
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', (string) $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', (string) $filters['priority']);
        }

        if (! empty($filters['office_id'])) {
            $query->where('current_department_id', (int) $filters['office_id']);
        }

        return $query;
    }

    /** @return array<int, array{key:string,label:string,count:int}> */
    private function viewOptions(Builder $filtered, User $actor): array
    {
        return collect(TransactionIndexRequest::VIEWS)
            ->map(fn (string $view): array => [
                'key' => $view,
                'label' => self::VIEW_LABELS[$view],
                'count' => $this->applyView(clone $filtered, $actor, $view)->count(),
            ])
            ->all();
    }

    private function records(Builder $filtered, User $actor, string $view): LengthAwarePaginator
    {
        $query = $this->applyView(clone $filtered, $actor, $view)
            ->with([
                'originDepartment:id,code,name,short_name',
                'currentDepartment:id,code,name,short_name',
                'assignedEmployee:id,employee_number,full_name,department_id,position_title',
            ]);

        $this->orderForQueue($query, $view);

        return $query->paginate(25)
            ->withQueryString()
            ->through(fn (WorkflowTransaction $transaction): array => $this->serialize($transaction, $actor));
    }

    private function applyView(Builder $query, User $actor, string $view): Builder
    {
        $terminal = $this->terminalStatuses();
        $departmentId = $actor->employee?->department_id;
        $employeeId = $actor->employee?->id;

        return match ($view) {
            'all' => $query,
            'needs_my_action' => $this->needsMyAction($query, $terminal, $employeeId),
            'assigned_to_me' => $query
                ->when($employeeId, fn (Builder $q) => $q->where('assigned_employee_id', $employeeId), fn (Builder $q) => $q->whereRaw('1 = 0')),
            'office_queue' => $this->active($query, $terminal)
                ->when($departmentId, fn (Builder $q) => $q->where('current_department_id', $departmentId), fn (Builder $q) => $q->whereRaw('1 = 0')),
            'unassigned' => $this->active($query, $terminal)->whereNull('assigned_employee_id'),
            'overdue' => $this->active($query, $terminal)->whereNotNull('due_at')->where('due_at', '<', now()),
            'due_soon' => $this->active($query, $terminal)->whereBetween('due_at', [now(), now()->addDay()]),
            'recently_updated' => $this->active($query, $terminal)->where('updated_at', '>=', now()->subDays(7)),
            'waiting_on_others' => $this->active($query, $terminal)
                ->when($departmentId, function (Builder $q) use ($departmentId): void {
                    $q->where('origin_department_id', $departmentId)
                        ->where('current_department_id', '!=', $departmentId);
                }, fn (Builder $q) => $q->whereRaw('1 = 0')),
            'recently_completed' => $this->recentlyCompleted($query, $terminal),
            default => $query,
        };
    }

    /** @param array<int, string> $terminal */
    private function needsMyAction(
        Builder $query,
        array $terminal,
        ?int $employeeId,
    ): Builder {
        return $this->active($query, $terminal)
            ->when(
                $employeeId,
                fn (Builder $q) => $q->where('assigned_employee_id', $employeeId),
                fn (Builder $q) => $q->whereRaw('1 = 0'),
            );
    }

    /** @param array<int, string> $terminal */
    private function active(Builder $query, array $terminal): Builder
    {
        return $query->whereNotIn('status', $terminal);
    }

    /** @param array<int, string> $terminal */
    private function recentlyCompleted(Builder $query, array $terminal): Builder
    {
        $cutoff = now()->subDays(30);

        return $query->whereIn('status', $terminal)
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $cutoff);
    }

    private function orderForQueue(Builder $query, string $view): void
    {
        if ($view === 'recently_completed') {
            $query->orderByDesc('completed_at')->orderByDesc('id');

            return;
        }

        $query->orderByRaw('CASE WHEN due_at IS NOT NULL AND due_at < ? THEN 0 ELSE 1 END', [now()])
            ->orderByRaw("CASE WHEN priority = 'urgent' THEN 0 WHEN priority = 'high' THEN 1 ELSE 2 END")
            ->orderByRaw('CASE WHEN due_at IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_at')
            ->orderByDesc('updated_at');
    }

    /** @return array<string, mixed> */
    private function serialize(WorkflowTransaction $transaction, User $actor): array
    {
        $terminal = $this->terminalStatuses();
        $active = ! in_array($transaction->status, $terminal, true);
        $employeeId = $actor->employee?->id;
        $dueState = 'on_track';

        if (! $active) {
            $dueState = 'completed';
        } elseif ($transaction->due_at?->isPast()) {
            $dueState = 'overdue';
        } elseif ($transaction->due_at?->lessThanOrEqualTo(now()->addDay())) {
            $dueState = 'due_soon';
        }

        $requiresAction = $active
            && $employeeId
            && (int) $transaction->assigned_employee_id === (int) $employeeId;

        return [
            'id' => $transaction->id,
            'reference' => $transaction->reference_no,
            'title' => $transaction->title,
            'transactionType' => $transaction->transaction_type,
            'priority' => $transaction->priority,
            'status' => $transaction->status,
            'originOffice' => $this->office($transaction->originDepartment),
            'currentOffice' => $this->office($transaction->currentDepartment),
            'assignedEmployee' => $transaction->assignedEmployee ? [
                'name' => $transaction->assignedEmployee->full_name,
                'position' => $transaction->assignedEmployee->position_title,
            ] : null,
            'receivedAt' => $transaction->received_at?->toIso8601String(),
            'dueAt' => $transaction->due_at?->toIso8601String(),
            'completedAt' => $transaction->completed_at?->toIso8601String(),
            'ageInOffice' => $transaction->received_at
                ? $transaction->received_at->diffForHumans(now(), true)
                : null,
            'dueState' => $dueState,
            'requiresAction' => $requiresAction,
        ];
    }

    /** @return array{id:int,code:string,name:string,shortName:?string}|null */
    private function office(?Department $department): ?array
    {
        if (! $department) {
            return null;
        }

        return [
            'id' => (int) $department->id,
            'code' => $department->code,
            'name' => $department->name,
            'shortName' => $department->short_name,
        ];
    }

    /** @return array<int, string> */
    private function statusOptions(Builder $authorized): array
    {
        return (clone $authorized)
            ->whereNotNull('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->values()
            ->all();
    }

    /** @return array<int, array{id:int,code:string,name:string,shortName:?string}> */
    private function officeOptions(Builder $authorized, User $actor): array
    {
        if ($this->visibility->canViewAll($actor)) {
            $query = Department::query()->where('is_active', true);
        } else {
            $ids = (clone $authorized)->distinct()->pluck('current_department_id')->filter()->all();
            if ($actor->employee?->department_id) {
                $ids[] = $actor->employee->department_id;
            }

            $query = Department::query()
                ->where('is_active', true)
                ->whereIn('id', array_values(array_unique($ids)));
        }

        return $query
            ->orderBy('branch')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'short_name'])
            ->map(fn (Department $department): array => [
                'id' => (int) $department->id,
                'code' => $department->code,
                'name' => $department->name,
                'shortName' => $department->short_name,
            ])
            ->all();
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
