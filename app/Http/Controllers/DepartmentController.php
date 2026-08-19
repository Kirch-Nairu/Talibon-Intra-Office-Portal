<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function __invoke(): Response
    {
        $departments = Department::query()
            ->activeRoutable()
            ->withCount([
                'employees as active_employees_count' => fn (Builder $query) => $query->where('employment_status', 'active'),
            ])
            ->orderBy('branch')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'short_name', 'branch', 'office_type', 'is_routable', 'sort_order'])
            ->map(function (Department $department): array {
                $activeTransactions = WorkflowTransaction::query()
                    ->where('current_department_id', $department->id)
                    ->whereNotIn('status', ['approved', 'disapproved', 'closed'])
                    ->count();

                return [
                    'id' => $department->id,
                    'code' => $department->code,
                    'name' => $department->name,
                    'short_name' => $department->short_name,
                    'branch' => $department->branch,
                    'office_type' => $department->office_type,
                    'is_routable' => $department->is_routable,
                    'active_employees_count' => $department->active_employees_count,
                    'active_transactions_count' => $activeTransactions,
                    'is_executive' => $department->code === 'MAYOR',
                    'is_legislative' => $department->branch === 'legislative',
                ];
            });

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'summary' => [
                'offices' => $departments->count(),
                'executiveOffices' => $departments->where('branch', 'executive')->count(),
                'legislativeOffices' => $departments->where('branch', 'legislative')->count(),
                'employees' => $departments->sum('active_employees_count'),
                'activeTransactions' => $departments->sum('active_transactions_count'),
            ],
        ]);
    }
}
