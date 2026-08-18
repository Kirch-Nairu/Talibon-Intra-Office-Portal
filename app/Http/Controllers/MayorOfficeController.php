<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\WorkflowTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MayorOfficeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadMissing('employee.department');
        abort_unless($user->isRole('system_admin', 'mayor_approver', 'mayor_staff') && ($user->isRole('system_admin') || $user->employee?->department?->code === 'MAYOR'), 403);

        $mayorDepartment = Department::query()->where('code', 'MAYOR')->firstOrFail();
        $queue = WorkflowTransaction::query()
            ->where('current_department_id', $mayorDepartment->id)
            ->whereNotIn('status', ['approved', 'disapproved', 'closed'])
            ->with(['originDepartment:id,code,name,short_name', 'currentDepartment:id,code,name,short_name'])
            ->latest()
            ->get();

        return Inertia::render('MayorOffice', [
            'queue' => $queue,
            'stats' => [
                'forApproval' => $queue->where('status', 'for_approval')->count(),
                'forReview' => $queue->where('status', 'for_review')->count(),
                'highPriority' => $queue->whereIn('priority', ['high', 'urgent'])->count(),
                'total' => $queue->count(),
            ],
        ]);
    }
}
