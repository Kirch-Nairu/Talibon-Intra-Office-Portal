<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadMissing('employee.department');
        $department = $user->employee?->department;

        $isMayorOffice = $department?->code === 'MAYOR';
        $isHr = $department?->code === 'HRMO' || $user->isRole('hr_officer', 'system_admin');
        $isLegislative = $department?->code === 'SB' || $user->isRole('legislative_staff', 'system_admin');

        return Inertia::render('Dashboard', [
            'workspace' => [
                'kind' => $isMayorOffice ? 'mayor' : 'department',
                'departmentName' => $department?->name ?? 'Municipal Administration',
                'departmentCode' => $department?->code,
                'canAccessHris' => $isHr,
                'canManageLegislation' => $isLegislative,
                'canSeeMunicipalOverview' => $user->isRole('system_admin', 'mayor_approver', 'mayor_staff'),
            ],
            'stats' => $this->prototypeStats($department?->code, $isMayorOffice),
            'recent' => $this->prototypeRecent($department?->code, $isMayorOffice),
            'departmentsCount' => Department::query()->where('is_active', true)->count(),
        ]);
    }

    private function prototypeStats(?string $departmentCode, bool $isMayorOffice): array
    {
        if ($isMayorOffice) {
            return [
                ['label' => 'For Review', 'value' => 14, 'tone' => 'blue'],
                ['label' => 'For Approval', 'value' => 7, 'tone' => 'amber'],
                ['label' => 'High Priority', 'value' => 3, 'tone' => 'rose'],
                ['label' => 'Completed Today', 'value' => 31, 'tone' => 'emerald'],
            ];
        }

        $seed = match ($departmentCode) {
            'ENG' => [4, 12, 6, 47],
            'BUDGET' => [8, 16, 3, 39],
            'HRMO' => [5, 14, 2, 52],
            'SB' => [3, 9, 4, 28],
            default => [4, 10, 3, 32],
        };

        return [
            ['label' => 'For Review', 'value' => $seed[0], 'tone' => 'blue'],
            ['label' => 'Incoming', 'value' => $seed[1], 'tone' => 'amber'],
            ['label' => 'Waiting on Others', 'value' => $seed[2], 'tone' => 'rose'],
            ['label' => 'Completed This Month', 'value' => $seed[3], 'tone' => 'emerald'],
        ];
    }

    private function prototypeRecent(?string $departmentCode, bool $isMayorOffice): array
    {
        if ($isMayorOffice) {
            return [
                ['ref' => 'TAL-2026-0184', 'title' => 'Road Rehabilitation Funding Request', 'status' => 'FOR APPROVAL', 'from' => 'Accounting Office'],
                ['ref' => 'TAL-2026-0179', 'title' => 'Municipal Equipment Acquisition', 'status' => 'FOR REVIEW', 'from' => 'Budget Office'],
                ['ref' => 'TAL-2026-0172', 'title' => 'Community Facility Endorsement', 'status' => 'FOR REVIEW', 'from' => 'Planning Office'],
            ];
        }

        return [
            ['ref' => 'TAL-2026-0184', 'title' => 'Road Rehabilitation Funding Request', 'status' => $departmentCode === 'ENG' ? 'FOR BUDGET REVIEW' : 'FOR REVIEW', 'from' => 'Engineering Office'],
            ['ref' => 'TAL-2026-0181', 'title' => 'Equipment Procurement Request', 'status' => 'RETURNED FOR REVISION', 'from' => 'General Services'],
            ['ref' => 'TAL-2026-0176', 'title' => 'Inter-Office Data Request', 'status' => 'AWAITING RESPONSE', 'from' => 'Planning Office'],
        ];
    }
}
