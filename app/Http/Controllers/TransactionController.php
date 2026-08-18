<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\WorkflowTransaction;
use App\Services\TransactionWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WorkflowTransaction::class);
        $user = $request->user()->loadMissing('employee.department');
        $departmentId = $user->employee?->department_id;

        $query = WorkflowTransaction::query()
            ->with([
                'originDepartment:id,code,name,short_name',
                'currentDepartment:id,code,name,short_name',
                'assignedEmployee:id,employee_number,full_name,department_id,position_title',
            ])
            ->latest();

        if (! $user->isRole('system_admin', 'mayor_approver', 'mayor_staff')) {
            $query->where(function ($q) use ($departmentId): void {
                $q->where('current_department_id', $departmentId)
                    ->orWhere('origin_department_id', $departmentId);
            });
        }

        return Inertia::render('Transactions/Index', [
            'transactions' => $query->limit(100)->get(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', WorkflowTransaction::class);
        $departmentId = $request->user()->employee?->department_id;

        return Inertia::render('Transactions/Create', [
            'departments' => Department::query()
                ->where('is_active', true)
                ->when($departmentId, fn ($query) => $query->where('id', '!=', $departmentId))
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'short_name']),
        ]);
    }

    public function store(Request $request, TransactionWorkflowService $workflow): RedirectResponse
    {
        $this->authorize('create', WorkflowTransaction::class);

        $data = $request->validate([
            'transaction_type' => ['required', Rule::in(['internal_request', 'project_endorsement', 'document_review', 'funding_request', 'other'])],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['required', Rule::in(['normal', 'high', 'urgent'])],
            'target_department_id' => ['required', 'integer', 'exists:departments,id'],
            'due_at' => ['nullable', 'date', 'after_or_equal:today'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $transaction = $workflow->create($request->user(), $data);

        return redirect()->route('transactions.show', $transaction)->with('success', "{$transaction->reference_no} was routed successfully.");
    }

    public function show(Request $request, WorkflowTransaction $transaction): Response
    {
        $this->authorize('view', $transaction);

        $transaction->load([
            'originDepartment:id,code,name,short_name',
            'currentDepartment:id,code,name,short_name',
            'creator:id,name,email',
            'assignedEmployee:id,employee_number,full_name,department_id,position_title',
            'events.actor.employee.department',
            'events.fromDepartment:id,code,name,short_name',
            'events.toDepartment:id,code,name,short_name',
        ]);

        $user = $request->user();
        $canTransition = $user->can('transition', $transaction);
        $canMayorDecision = $user->can('mayorDecision', $transaction);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'departments' => Department::query()->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'short_name']),
            'assignableEmployees' => $canTransition
                ? Employee::query()
                    ->where('department_id', $transaction->current_department_id)
                    ->where('employment_status', 'active')
                    ->orderBy('full_name')
                    ->limit(100)
                    ->get(['id', 'employee_number', 'full_name', 'position_title'])
                : [],
            'accountability' => $this->accountability($transaction),
            'permissions' => [
                'canTransition' => $canTransition,
                'canMayorDecision' => $canMayorDecision,
                'canAssign' => $canTransition,
            ],
        ]);
    }

    public function transition(Request $request, WorkflowTransaction $transaction, TransactionWorkflowService $workflow): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['assign', 'mark_review', 'forward', 'send_to_mayor', 'return_origin', 'request_information', 'approve', 'disapprove'])],
            'target_department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'assigned_employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        if (in_array($data['action'], ['approve', 'disapprove'], true)) {
            $this->authorize('mayorDecision', $transaction);
        } else {
            $this->authorize('transition', $transaction);
        }

        $updated = $workflow->transition(
            $request->user(),
            $transaction,
            $data['action'],
            $data['target_department_id'] ?? null,
            $data['assigned_employee_id'] ?? null,
            $data['remarks'] ?? null,
        );

        return redirect()->route('transactions.show', $updated)->with('success', 'Transaction workflow updated.');
    }

    private function accountability(WorkflowTransaction $transaction): array
    {
        $terminal = in_array($transaction->status, ['approved', 'disapproved', 'closed'], true);
        $dueState = 'on_track';

        if ($terminal) {
            $dueState = 'completed';
        } elseif ($transaction->due_at?->isPast()) {
            $dueState = 'overdue';
        } elseif ($transaction->due_at && $transaction->due_at->lessThanOrEqualTo(now()->addDay())) {
            $dueState = 'due_soon';
        }

        return [
            'dueState' => $dueState,
            'timeInCurrentOffice' => $transaction->received_at
                ? $transaction->received_at->diffForHumans(now(), true)
                : 'Not recorded',
            'receivedAt' => $transaction->received_at?->toIso8601String(),
            'dueAt' => $transaction->due_at?->toIso8601String(),
            'completedAt' => $transaction->completed_at?->toIso8601String(),
        ];
    }
}
