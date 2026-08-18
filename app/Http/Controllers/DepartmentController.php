<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function __invoke(): Response
    {
        $departments = Department::query()
            ->where('is_active', true)
            ->withCount([
                'employees as active_employees_count' => fn (Builder $query) => $query->where('employment_status', 'active'),
            ])
            ->orderByRaw("CASE WHEN code = 'MAYOR' THEN 0 WHEN code = 'SB' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'short_name'])
            ->map(function (Department $department): array {
                $activeTransactions = \App\Models\WorkflowTransaction::query()
                    ->where('current_department_id', $department->id)
                    ->whereNotIn('status', ['approved', 'disapproved', 'closed'])
                    ->count();

                return [
                    'id' => $department->id,
                    'code' => $department->code,
                    'name' => $department->name,
                    'short_name' => $department->short_name,
                    'active_employees_count' => $department->active_employees_count,
                    'active_transactions_count' => $activeTransactions,
                    'is_executive' => $department->code === 'MAYOR',
                    'is_legislative' => $department->code === 'SB',
                ];
            });

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'summary' => [
                'offices' => $departments->count(),
                'employees' => $departments->sum('active_employees_count'),
                'activeTransactions' => $departments->sum('active_transactions_count'),
            ],
        ]);
    }
}
