<?php

namespace App\Http\Controllers;

use App\Models\PayrollEntry;
use App\Models\PayrollPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadMissing('employee.department');
        $employee = $user->employee;
        abort_unless($employee, 403);

        $period = PayrollPeriod::query()->latest('period_end')->first();
        $entry = $period
            ? PayrollEntry::query()
                ->where('payroll_period_id', $period->id)
                ->where('employee_id', $employee->id)
                ->first()
            : null;

        $canAdmin = $user->isRole('system_admin', 'hr_officer');
        $adminSummary = null;
        $adminEntries = [];

        if ($canAdmin && $period) {
            $query = PayrollEntry::query()->where('payroll_period_id', $period->id);
            $adminSummary = [
                'employees' => (clone $query)->count(),
                'gross' => (float) (clone $query)->sum('gross_pay'),
                'deductions' => (float) (clone $query)->sum('total_deductions'),
                'net' => (float) (clone $query)->sum('net_pay'),
                'released' => (clone $query)->where('status', 'released')->count(),
            ];

            $adminEntries = PayrollEntry::query()
                ->where('payroll_period_id', $period->id)
                ->with('employee.department:id,code,name,short_name')
                ->orderByDesc('net_pay')
                ->limit(40)
                ->get();
        }

        return Inertia::render('Hris/Payroll', [
            'period' => $period,
            'employee' => $employee->loadMissing('department'),
            'entry' => $entry,
            'canAdmin' => $canAdmin,
            'adminSummary' => $adminSummary,
            'adminEntries' => $adminEntries,
        ]);
    }
}
