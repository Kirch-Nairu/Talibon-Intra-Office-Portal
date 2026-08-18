<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\LegislativeRecord;
use App\Models\Memorandum;
use App\Models\OperationalItem;
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
        $isHr = $department->code === 'HRMO' || $user->isRole('hr_officer', 'system_admin');
        $isLegislative = $department->code === 'SB' || $user->isRole('legislative_staff', 'system_admin');
        $canSeeMunicipalOverview = $user->isRole('system_admin', 'mayor_approver', 'mayor_staff');

        return Inertia::render('Dashboard', [
            'workspace' => [
                'kind' => $isMayorOffice ? 'mayor' : 'department',
                'departmentName' => $department->name,
                'departmentCode' => $department->code,
                'canAccessHris' => $isHr,
                'canManageLegislation' => $isLegislative,
                'canSeeMunicipalOverview' => $canSeeMunicipalOverview,
            ],
            'stats' => $isMayorOffice
                ? $this->mayorStats($department->id)
                : $this->departmentStats($department->id),
            'recent' => $this->recentTransactions($department->id, $isMayorOffice),
            'departmentsCount' => Department::query()->where('is_active', true)->count(),
            'municipalOverview' => $canSeeMunicipalOverview ? $this->municipalOverview($department->id) : null,
            'departmentWorkload' => $canSeeMunicipalOverview ? $this->departmentWorkload() : [],
            'centralRecords' => $this->centralRecords(),
            'operationsSnapshot' => $canSeeMunicipalOverview ? $this->operationsSnapshot() : null,
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
            'workforce' => Employee::query()->where('employment_status', 'active')->count(),
            'offices' => Department::query()->where('is_active', true)->count(),
        ];
    }

    private function departmentWorkload(): array
    {
        $terminal = ['approved', 'disapproved', 'closed'];

        return Department::query()
            ->where('is_active', true)
            ->withCount([
                'employees as active_employees_count' => fn (Builder $query) => $query->where('employment_status', 'active'),
            ])
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
                    'employees' => $department->active_employees_count,
                    'active' => (clone $active)->count(),
                    'overdue' => (clone $active)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
                    'dueSoon' => (clone $active)->whereBetween('due_at', [now(), now()->addDay()])->count(),
                ];
            })
            ->sortByDesc(fn (array $office): int => ($office['overdue'] * 100) + ($office['active'] * 10) + $office['dueSoon'])
            ->values()
            ->all();
    }

    private function centralRecords(): array
    {
        $recordsByType = LegislativeRecord::query()
            ->selectRaw('record_type, COUNT(*) as total')
            ->groupBy('record_type')
            ->pluck('total', 'record_type')
            ->map(fn ($count): int => (int) $count)
            ->all();

        return [
            'memoranda' => Memorandum::query()->where('status', 'published')->count(),
            'ordinances' => $recordsByType['ordinance'] ?? 0,
            'resolutions' => $recordsByType['resolution'] ?? 0,
            'executiveOrders' => $recordsByType['executive_order'] ?? 0,
            'officeOrders' => $recordsByType['office_order'] ?? 0,
            'administrativeOrders' => $recordsByType['administrative_order'] ?? 0,
            'circulars' => $recordsByType['circular'] ?? 0,
            'latestRecords' => LegislativeRecord::query()
                ->orderByDesc('approved_at')
                ->limit(4)
                ->get(['id', 'record_type', 'record_number', 'title', 'issuing_body'])
                ->map(fn (LegislativeRecord $record): array => [
                    'id' => $record->id,
                    'type' => $record->record_type,
                    'number' => $record->record_number,
                    'title' => $record->title,
                    'issuingBody' => $record->issuing_body,
                ])
                ->all(),
            'latestMemos' => Memorandum::query()
                ->where('status', 'published')
                ->latest('published_at')
                ->limit(3)
                ->get(['id', 'memo_number', 'title', 'published_at'])
                ->map(fn (Memorandum $memo): array => [
                    'id' => $memo->id,
                    'number' => $memo->memo_number,
                    'title' => $memo->title,
                    'publishedAt' => $memo->published_at?->toIso8601String(),
                ])
                ->all(),
        ];
    }

    private function operationsSnapshot(): array
    {
        $funds = OperationalItem::query()->where('item_type', 'fund');
        $allocated = (float) (clone $funds)->sum('allocated_amount');
        $utilized = (float) (clone $funds)->sum('utilized_amount');

        return [
            'projects' => OperationalItem::query()->where('item_type', 'project')->count(),
            'procurement' => OperationalItem::query()->where('item_type', 'procurement')->count(),
            'funds' => OperationalItem::query()->where('item_type', 'fund')->count(),
            'compliance' => OperationalItem::query()->where('item_type', 'compliance')->count(),
            'overdue' => OperationalItem::query()
                ->whereNotIn('status', ['completed', 'closed', 'cancelled'])
                ->whereNotNull('target_date')
                ->whereDate('target_date', '<', today())
                ->count(),
            'fundUtilizationPercent' => $allocated > 0 ? (int) round(($utilized / $allocated) * 100) : 0,
        ];
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
