<?php

namespace App\Http\Controllers;

use App\Domain\Workflow\WorkflowDefinitionResolver;
use App\Http\Requests\TransactionIndexRequest;
use App\Models\Department;
use App\Models\WorkflowTransaction;
use App\Services\TransactionLiveQuery;
use App\Services\TransactionWorkflowService;
use App\Services\WorkQueueQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(
        TransactionIndexRequest $request,
        WorkQueueQuery $queue,
    ): Response {
        $this->authorize('viewAny', WorkflowTransaction::class);

        return Inertia::render(
            'Transactions/Index',
            $queue->workspace($request->user(), $request->validated()),
        );
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', WorkflowTransaction::class);
        $departmentId = $request->user()->employee?->department_id;

        return Inertia::render('Transactions/Create', [
            'departments' => Department::query()
                ->activeRoutable()
                ->when($departmentId, fn ($query) => $query->where('id', '!=', $departmentId))
                ->orderBy('branch')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'short_name', 'branch', 'office_type']),
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
            'target_department_id' => [
                'required',
                'integer',
                Rule::exists('departments', 'id')->where(
                    fn ($query) => $query->where('is_active', true)->where('is_routable', true),
                ),
            ],
            'due_at' => ['nullable', 'date', 'after_or_equal:today'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $transaction = $workflow->create($request->user(), $data);

        return redirect()->route('transactions.show', $transaction)->with('success', "{$transaction->reference_no} was routed successfully.");
    }

    public function show(
        Request $request,
        WorkflowTransaction $transaction,
        TransactionLiveQuery $live,
    ): Response {
        $this->authorize('view', $transaction);

        $transaction->load([
            'originDepartment:id,code,name,short_name',
            'currentDepartment:id,code,name,short_name',
            'creator:id,name,email',
            'assignedEmployee:id,employee_number,full_name,department_id,position_title',
            'events.actor:id,name',
            'events.fromDepartment:id,code,name,short_name',
            'events.toDepartment:id,code,name,short_name',
        ]);

        $mutable = $live->snapshot(
            $request->user(),
            $transaction,
            includeEvents: false,
        );

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'departments' => Department::query()
                ->activeRoutable()
                ->orderBy('branch')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'short_name', 'branch', 'office_type']),
            'assignableEmployees' => $mutable['assignableEmployees'],
            'accountability' => $mutable['accountability'],
            'permissions' => $mutable['permissions'],
        ]);
    }

    public function transition(
        Request $request,
        WorkflowTransaction $transaction,
        TransactionWorkflowService $workflow,
        WorkflowDefinitionResolver $definitions,
    ): RedirectResponse {
        $definition = $definitions->resolve($transaction);

        $data = $request->validate([
            'action' => ['required', Rule::in($definition->actions())],
            'target_department_id' => [
                'nullable',
                'integer',
                Rule::exists('departments', 'id')->where(
                    fn ($query) => $query->where('is_active', true)->where('is_routable', true),
                ),
            ],
            'assigned_employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($data['action'] === 'assign') {
            $this->authorize('assign', $transaction);
        } elseif (in_array($data['action'], ['approve', 'disapprove'], true)) {
            $this->authorize('mayorDecision', $transaction);
        } elseif ($data['action'] === 'request_information' && $request->user()->can('mayorDecision', $transaction)) {
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
}
