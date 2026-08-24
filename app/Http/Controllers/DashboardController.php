<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\TransactionEvent;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadMissing('employee.department');
        $department = $user->employee?->department;
        abort_unless($department, 403);

        $isMayorOffice = $department->code === 'MAYOR';
        $canSeeMunicipalOverview = $user->isRole('system_admin', 'mayor_approver', 'mayor_staff');

        return Inertia::render('Dashboard', [
            'workspace' => [
                'kind' => $isMayorOffice ? 'mayor' : 'department',
                'departmentName' => $department->name,
                'departmentCode' => $department->code,
                'canSeeMunicipalOverview' => $canSeeMunicipalOverview,
            ],
            'stats' => $isMayorOffice
                ? $this->mayorStats($department->id)
                : $this->departmentStats($department->id),
            'recent' => $this->recentTransactions($department->id, $isMayorOffice),
            'municipalOverview' => $canSeeMunicipalOverview ? $this->municipalOverview($department->id) : null,
            'departmentWorkload' => $canSeeMunicipalOverview ? $this->departmentWorkload() : [],
        ]);
    }

    private function mayorStats(int $departmentId): array
    {
        $active = fn (): Builder => WorkflowTransaction::query()
            ->where('current_department_id', $departmentId)
            ->whereNotIn('status', ['approved', 'disapproved', 'closed']);

        return [
            ['label' => 'For Review', 'value' => $active()->where('status', 'for_review')->count(), 'tone' => 'blue'],
            ['label' => 'For Approval', 'value' => $active()->where('status', 'for_approval')->count(), 'tone' => 'amber'],
            ['label' => 'High Priority', 'value' => $active()->whereIn('priority', ['high', 'urgent'])->count(), 'tone' => 'rose'],
            ['label' => 'Approved Today', 'value' => TransactionEvent::query()->where('action', 'approve')->where('created_at', '>=', now()->startOfDay())->count(), 'tone' => 'emerald'],
        ];
    }

    private function departmentStats(int $departmentId): array
    {
        $terminalStatuses = ['approved', 'disapproved', 'closed'];

        return [
            [
                'label' => 'For Review',
                'value' => WorkflowTransaction::query()->where('current_department_id', $departmentId)->where('status', 'for_review')->count(),
                'tone' => 'blue',
            ],
            [
                'label' => 'Incoming',
                'value' => WorkflowTransaction::query()->where('current_department_id', $departmentId)->where('origin_department_id', '!=', $departmentId)->whereNotIn('status', $terminalStatuses)->count(),
                'tone' => 'amber',
            ],
            [
                'label' => 'Waiting on Others',
                'value' => WorkflowTransaction::query()->where('origin_department_id', $departmentId)->where('current_department_id', '!=', $departmentId)->whereNotIn('status', $terminalStatuses)->count(),
                'tone' => 'rose',
            ],
            [
                'label' => 'Completed This Month',
                'value' => WorkflowTransaction::query()->where('origin_department_id', $departmentId)->whereIn('status', $terminalStatuses)->where('updated_at', '>=', now()->startOfMonth())->count(),
                'tone' => 'emerald',
            ],
        ];
    }

    private function municipalOverview(int $mayorDepartmentId): array
    {
        $terminal = ['approved', 'disapproved', 'closed'];
        $active = WorkflowTransaction::query()->whereNotIn('status', $terminal);

        return [
            'activeTransactions' => (clone $active)->count(),
            'executiveQueue' => (clone $active)->where('current_department_id', $mayorDepartmentId)->count(),
            'overdue' => (clone $active)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
            'highPriority' => (clone $active)->whereIn('priority', ['high', 'urgent'])->count(),
            'completedThisMonth' => WorkflowTransaction::query()->whereIn('status', $terminal)->where('updated_at', '>=', now()->startOfMonth())->count(),
            'offices' => Department::query()->where('is_active', true)->count(),
        ];
    }

    private function departmentWorkload(): array
    {
        $terminal = ['approved', 'disapproved', 'closed'];

        return Department::query()
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN code = 'MAYOR' THEN 0 WHEN code = 'SB' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'short_name'])
            ->map(function (Department $department) use ($terminal): array {
                $active = WorkflowTransaction::query()
                    ->where('current_department_id', $department->id)
                    ->whereNotIn('status', $terminal);

                return [
                    'id' => $department->id,
                    'code' => $department->code,
                    'name' => $department->name,
                    'shortName' => $department->short_name,
                    'active' => (clone $active)->count(),
                    'overdue' => (clone $active)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
                    'dueSoon' => (clone $active)->whereBetween('due_at', [now(), now()->addDay()])->count(),
                ];
            })
            ->sortByDesc(fn (array $office): int => ($office['overdue'] * 100) + ($office['active'] * 10) + $office['dueSoon'])
            ->values()
            ->all();
    }

    private function recentTransactions(int $departmentId, bool $isMayorOffice): array
    {
        $query = WorkflowTransaction::query()
            ->with([
                'originDepartment:id,code,name,short_name',
                'currentDepartment:id,code,name,short_name',
            ]);

        if ($isMayorOffice) {
            $query->where('current_department_id', $departmentId);
        } else {
            $query->where(function (Builder $nested) use ($departmentId): void {
                $nested->where('current_department_id', $departmentId)
                    ->orWhere('origin_department_id', $departmentId);
            });
        }

        return $query->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn (WorkflowTransaction $transaction): array => [
                'id' => $transaction->id,
                'ref' => $transaction->reference_no,
                'title' => $transaction->title,
                'status' => strtoupper(str_replace('_', ' ', $transaction->status)),
                'from' => $transaction->originDepartment?->short_name
                    ?? $transaction->originDepartment?->name
                    ?? 'Unknown office',
            ])
            ->all();
    }
}
