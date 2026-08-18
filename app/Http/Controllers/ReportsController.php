<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LegislativeRecord;
use App\Models\Memorandum;
use App\Models\MemoRecipient;
use App\Models\OperationalItem;
use App\Models\PayrollEntry;
use App\Models\PayrollPeriod;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->loadMissing('employee.department');
        $isExecutive = $user->isRole('system_admin', 'mayor_approver', 'mayor_staff');
        $isHr = $user->isRole('system_admin', 'hr_officer');
        abort_unless($isExecutive || $isHr, 403);

        $terminal = ['approved', 'disapproved', 'closed'];
        $activeTransactions = WorkflowTransaction::query()->whereNotIn('status', $terminal);
        $period = PayrollPeriod::query()->latest('period_end')->first();

        $departmentWorkload = Department::query()
            ->where('is_active', true)
            ->withCount([
                'employees as active_employees_count' => fn (Builder $query) => $query->where('employment_status', 'active'),
            ])
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'short_name'])
            ->map(function (Department $department) use ($terminal): array {
                $active = WorkflowTransaction::query()
                    ->where('current_department_id', $department->id)
                    ->whereNotIn('status', $terminal);

                return [
                    'code' => $department->code,
                    'office' => $department->short_name ?? $department->name,
                    'employees' => $department->active_employees_count,
                    'active' => (clone $active)->count(),
                    'overdue' => (clone $active)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
                ];
            })
            ->sortByDesc(fn (array $row): int => ($row['overdue'] * 100) + $row['active'])
            ->values()
            ->all();

        $aging = WorkflowTransaction::query()
            ->with(['originDepartment:id,name,short_name', 'currentDepartment:id,name,short_name', 'assignedEmployee:id,full_name'])
            ->whereNotIn('status', $terminal)
            ->orderByRaw('due_at IS NULL')
            ->orderBy('due_at')
            ->limit(25)
            ->get()
            ->map(fn (WorkflowTransaction $tx): array => [
                'id' => $tx->id,
                'reference' => $tx->reference_no,
                'title' => $tx->title,
                'origin' => $tx->originDepartment?->short_name ?? $tx->originDepartment?->name,
                'current' => $tx->currentDepartment?->short_name ?? $tx->currentDepartment?->name,
                'responsible' => $tx->assignedEmployee?->full_name ?? 'Unassigned',
                'status' => strtoupper(str_replace('_', ' ', $tx->status)),
                'due' => $tx->due_at?->toIso8601String(),
                'overdue' => $tx->due_at?->isPast() ?? false,
                'age' => $tx->received_at?->diffForHumans(now(), true) ?? 'Not recorded',
            ])
            ->all();

        $memoRecipients = MemoRecipient::query();
        $payrollQuery = $period ? PayrollEntry::query()->where('payroll_period_id', $period->id) : null;

        return Inertia::render('Reports/Index', [
            'permissions' => [
                'executive' => $isExecutive,
                'hr' => $isHr,
            ],
            'summary' => [
                'activeTransactions' => (clone $activeTransactions)->count(),
                'overdueTransactions' => (clone $activeTransactions)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
                'completedThisMonth' => WorkflowTransaction::query()->whereIn('status', $terminal)->where('updated_at', '>=', now()->startOfMonth())->count(),
                'offices' => Department::query()->where('is_active', true)->count(),
                'employees' => Employee::query()->where('employment_status', 'active')->count(),
                'memoranda' => Memorandum::query()->count(),
                'memoDelivered' => (clone $memoRecipients)->count(),
                'memoAcknowledged' => (clone $memoRecipients)->whereNotNull('acknowledged_at')->count(),
                'municipalRecords' => LegislativeRecord::query()->count(),
                'leavePending' => LeaveRequest::query()->where('status', 'pending')->count(),
                'attendanceEvents' => AttendanceLog::query()->count(),
                'operations' => OperationalItem::query()->count(),
                'operationsOverdue' => OperationalItem::query()->whereNotNull('target_date')->whereDate('target_date', '<', today())->whereNotIn('status', ['completed', 'closed', 'cancelled'])->count(),
                'payrollPeriod' => $period?->label,
                'payrollEmployees' => $isHr && $payrollQuery ? (clone $payrollQuery)->count() : 0,
                'payrollNet' => $isHr && $payrollQuery ? (float) (clone $payrollQuery)->sum('net_pay') : 0,
            ],
            'departmentWorkload' => $departmentWorkload,
            'transactionAging' => $aging,
            'operationsByType' => OperationalItem::query()
                ->selectRaw('item_type, COUNT(*) as total')
                ->groupBy('item_type')
                ->pluck('total', 'item_type'),
            'recordsByType' => LegislativeRecord::query()
                ->selectRaw('record_type, COUNT(*) as total')
                ->groupBy('record_type')
                ->pluck('total', 'record_type'),
        ]);
    }

    public function export(Request $request, string $report): StreamedResponse
    {
        abort_unless(in_array($report, ['department-workload', 'transaction-aging', 'employee-directory', 'operations', 'payroll-summary'], true), 404);

        $user = $request->user()->loadMissing('employee.department');
        $isExecutive = $user->isRole('system_admin', 'mayor_approver', 'mayor_staff');
        $isHr = $user->isRole('system_admin', 'hr_officer');

        $allowed = match ($report) {
            'payroll-summary' => $isHr,
            'employee-directory' => $isExecutive || $isHr,
            default => $isExecutive,
        };
        abort_unless($allowed, 403);

        $filename = 'talibon-'.$report.'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($report): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            switch ($report) {
                case 'department-workload':
                    $this->writeDepartmentWorkloadCsv($out);
                    break;
                case 'transaction-aging':
                    $this->writeTransactionAgingCsv($out);
                    break;
                case 'employee-directory':
                    $this->writeEmployeeDirectoryCsv($out);
                    break;
                case 'operations':
                    $this->writeOperationsCsv($out);
                    break;
                case 'payroll-summary':
                    $this->writePayrollCsv($out);
                    break;
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function writeDepartmentWorkloadCsv($out): void
    {
        fputcsv($out, ['Office Code', 'Office', 'Active Employees', 'Active Transactions', 'Overdue Transactions']);

        Department::query()->where('is_active', true)->orderBy('name')->get()->each(function (Department $department) use ($out): void {
            $active = WorkflowTransaction::query()->where('current_department_id', $department->id)->whereNotIn('status', ['approved', 'disapproved', 'closed']);
            fputcsv($out, [
                $department->code,
                $department->name,
                Employee::query()->where('department_id', $department->id)->where('employment_status', 'active')->count(),
                (clone $active)->count(),
                (clone $active)->whereNotNull('due_at')->where('due_at', '<', now())->count(),
            ]);
        });
    }

    private function writeTransactionAgingCsv($out): void
    {
        fputcsv($out, ['Reference', 'Title', 'Origin', 'Current Office', 'Responsible Employee', 'Status', 'Priority', 'Received At', 'Due At']);

        WorkflowTransaction::query()
            ->with(['originDepartment', 'currentDepartment', 'assignedEmployee'])
            ->whereNotIn('status', ['approved', 'disapproved', 'closed'])
            ->orderBy('due_at')
            ->get()
            ->each(fn (WorkflowTransaction $tx) => fputcsv($out, [
                $tx->reference_no,
                $tx->title,
                $tx->originDepartment?->name,
                $tx->currentDepartment?->name,
                $tx->assignedEmployee?->full_name ?? 'Unassigned',
                $tx->status,
                $tx->priority,
                $tx->received_at?->toDateTimeString(),
                $tx->due_at?->toDateTimeString(),
            ]));
    }

    private function writeEmployeeDirectoryCsv($out): void
    {
        fputcsv($out, ['Employee Number', 'Employee', 'Work Email', 'Office', 'Position', 'Employment Status', 'Portal Account']);

        Employee::query()->with('department')->orderBy('employee_number')->get()->each(fn (Employee $employee) => fputcsv($out, [
            $employee->employee_number,
            $employee->full_name,
            $employee->work_email,
            $employee->department?->name,
            $employee->position_title,
            $employee->employment_status,
            $employee->user_id ? 'Yes' : 'No',
        ]));
    }

    private function writeOperationsCsv($out): void
    {
        fputcsv($out, ['Type', 'Reference', 'Title', 'Office', 'Responsible Employee', 'Status', 'Priority', 'Target Date', 'Progress', 'Allocated', 'Utilized']);

        OperationalItem::query()->with(['department', 'responsibleEmployee'])->orderBy('item_type')->orderBy('target_date')->get()->each(fn (OperationalItem $item) => fputcsv($out, [
            $item->item_type,
            $item->reference_no,
            $item->title,
            $item->department?->name,
            $item->responsibleEmployee?->full_name ?? 'Unassigned',
            $item->status,
            $item->priority,
            $item->target_date?->toDateString(),
            $item->progress_percent.'%',
            $item->allocated_amount,
            $item->utilized_amount,
        ]));
    }

    private function writePayrollCsv($out): void
    {
        $period = PayrollPeriod::query()->latest('period_end')->first();
        fputcsv($out, ['Period', 'Employee Number', 'Employee', 'Office', 'Gross Pay', 'Total Deductions', 'Net Pay', 'Status']);

        if (! $period) {
            return;
        }

        PayrollEntry::query()->where('payroll_period_id', $period->id)->with('employee.department')->get()->each(fn (PayrollEntry $entry) => fputcsv($out, [
            $period->label,
            $entry->employee?->employee_number,
            $entry->employee?->full_name,
            $entry->employee?->department?->name,
            $entry->gross_pay,
            $entry->total_deductions,
            $entry->net_pay,
            $entry->status,
        ]));
    }
}
