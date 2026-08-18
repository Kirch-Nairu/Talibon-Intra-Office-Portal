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
        $isHr = $department->code === 'HRMO' || $user->isRole('hr_officer', 'system_admin');
        $isLegislative = $department->code === 'SB' || $user->isRole('legislative_staff', 'system_admin');

        return Inertia::render('Dashboard', [
            'workspace' => [
                'kind' => $isMayorOffice ? 'mayor' : 'department',
                'departmentName' => $department->name,
                'departmentCode' => $department->code,
                'canAccessHris' => $isHr,
                'canManageLegislation' => $isLegislative,
                'canSeeMunicipalOverview' => $user->isRole('system_admin', 'mayor_approver', 'mayor_staff'),
            ],
            'stats' => $isMayorOffice
                ? $this->mayorStats($department->id)
                : $this->departmentStats($department->id),
            'recent' => $this->recentTransactions($department->id, $isMayorOffice),
            'departmentsCount' => Department::query()->where('is_active', true)->count(),
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
                'value' => WorkflowTransaction::query()
                    ->where('current_department_id', $departmentId)
                    ->where('status', 'for_review')
                    ->count(),
                'tone' => 'blue',
            ],
            [
                'label' => 'Incoming',
                'value' => WorkflowTransaction::query()
                    ->where('current_department_id', $departmentId)
                    ->where('origin_department_id', '!=', $departmentId)
                    ->whereNotIn('status', $terminalStatuses)
                    ->count(),
                'tone' => 'amber',
            ],
            [
                'label' => 'Waiting on Others',
                'value' => WorkflowTransaction::query()
                    ->where('origin_department_id', $departmentId)
                    ->where('current_department_id', '!=', $departmentId)
                    ->whereNotIn('status', $terminalStatuses)
                    ->count(),
                'tone' => 'rose',
            ],
            [
                'label' => 'Completed This Month',
                'value' => WorkflowTransaction::query()
                    ->where('origin_department_id', $departmentId)
                    ->whereIn('status', $terminalStatuses)
                    ->where('updated_at', '>=', now()->startOfMonth())
                    ->count(),
                'tone' => 'emerald',
            ],
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
