<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkQueueTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_is_default_and_returns_the_authorized_base_set_without_cross_office_leakage(): void
    {
        $office = $this->department('ALL-OWN');
        $other = $this->department('ALL-OTHER');
        $third = $this->department('ALL-THIRD');
        $actor = $this->human('department_head', $office);
        $otherHead = $this->human('department_head', $other);

        $this->transaction('Assigned local work', $office, $office, $actor, $actor->employee, now()->addDays(2));
        $this->transaction('Unassigned incoming work', $other, $office, $actor, dueAt: now()->addDays(3));
        $this->transaction('Waiting on another office', $office, $other, $actor, dueAt: now()->addDays(4));
        $this->transaction(
            'Recently completed local work',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDay(),
            status: 'approved',
            completedAt: now()->subDays(2),
        );
        $hidden = $this->transaction('Unrelated hidden work', $other, $third, $otherHead, dueAt: now()->addDay());

        $response = $this->actingAs($actor)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Transactions/Index')
                ->where('filters.view', 'all')
                ->where('records.total', 4)
                ->has('records.data', 4)
                ->has('views', 10)
                ->where('views.0.key', 'all')
                ->where('views.0.label', 'All')
                ->where('views.0.count', 4)
                ->where('views.1.key', 'needs_my_action')
                ->where('views.2.key', 'assigned_to_me')
                ->where('views.3.key', 'office_queue')
                ->where('views.4.key', 'unassigned')
                ->where('views.5.key', 'overdue')
                ->where('views.6.key', 'due_soon')
                ->where('views.7.key', 'recently_updated')
                ->where('views.8.key', 'waiting_on_others')
                ->where('views.9.key', 'recently_completed')
                ->where('workspace.canViewAll', false));

        $this->assertStringNotContainsString($hidden->title, $response->getContent());
        $this->assertStringNotContainsString((string) $hidden->reference_no, $response->getContent());
    }

    public function test_needs_my_action_is_active_current_assignment_only_and_assigned_to_me_keeps_terminal_assignment(): void
    {
        $office = $this->department('ASSIGN');
        $other = $this->department('ASSIGN-OTHER');
        $actor = $this->human('department_head', $office);
        $otherStaff = $this->human('department_staff', $office);

        $mine = $this->transaction('Active assigned to actor', $other, $office, $actor, $actor->employee, now()->addDays(2));
        $this->transaction('Active unassigned office work', $other, $office, $actor, dueAt: now()->addDays(3));
        $this->transaction('Active assigned to another employee', $other, $office, $actor, $otherStaff->employee, now()->addDays(4));
        $terminalMine = $this->transaction(
            'Terminal still assigned to actor',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDay(),
            status: 'approved',
            completedAt: now()->subDay(),
        );

        $this->actingAs($actor)->get('/transactions?view=needs_my_action')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.view', 'needs_my_action')
                ->where('records.total', 1)
                ->where('records.data.0.id', $mine->id)
                ->where('records.data.0.requiresAction', true));

        $this->actingAs($actor)->get('/transactions?view=assigned_to_me')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 2)
                ->where('views.2.count', 2));

        $this->actingAs($actor)->get('/transactions?view=assigned_to_me&status=approved')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 1)
                ->where('records.data.0.id', $terminalMine->id)
                ->where('records.data.0.requiresAction', false));
    }

    public function test_unassigned_and_office_queue_remain_active_projections(): void
    {
        $office = $this->department('OFFICE');
        $other = $this->department('OFFICE-OTHER');
        $actor = $this->human('department_head', $office);

        $unassigned = $this->transaction('Active unassigned', $other, $office, $actor, dueAt: now()->addDays(2));
        $assigned = $this->transaction('Active assigned', $other, $office, $actor, $actor->employee, now()->addDays(3));
        $this->transaction(
            'Terminal office work',
            $office,
            $office,
            $actor,
            dueAt: now()->subDay(),
            status: 'approved',
            completedAt: now()->subDay(),
        );

        $this->assertSingleView($actor, 'unassigned', $unassigned);

        $this->actingAs($actor)->get('/transactions?view=office_queue')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 2)
                ->has('records.data', 2)
                ->where('records.data.1.id', $assigned->id)
                ->where('views.3.count', 2));
    }

    public function test_overdue_due_soon_waiting_and_recently_completed_use_correct_existing_fields(): void
    {
        $office = $this->department('TIMING');
        $other = $this->department('TIMING-OTHER');
        $actor = $this->human('department_head', $office);
        $otherStaff = $this->human('department_staff', $other);

        $overdue = $this->transaction('Overdue active', $other, $office, $actor, $actor->employee, now()->subDay());
        $dueSoon = $this->transaction('Due soon active', $other, $office, $actor, $actor->employee, now()->addHours(6));
        $this->transaction('Waiting elsewhere', $office, $other, $actor, $otherStaff->employee, now()->addDays(3));

        $recent = $this->transaction(
            'Recent completed',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDay(),
            status: 'approved',
            completedAt: now()->subDays(3),
        );
        $nullCompleted = $this->transaction(
            'Terminal with no completion timestamp',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDay(),
            status: 'approved',
            completedAt: null,
        );
        $nullCompleted->touch();

        $this->transaction(
            'Old completed timestamp',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDays(60),
            status: 'approved',
            completedAt: now()->subDays(60),
        );
        $this->transaction(
            'Active with completion timestamp',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->addDays(4),
            status: 'submitted',
            completedAt: now()->subDay(),
        );

        $this->assertSingleView($actor, 'overdue', $overdue);
        $this->assertSingleView($actor, 'due_soon', $dueSoon);

        $this->actingAs($actor)->get('/transactions?view=waiting_on_others')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('records.total', 1));

        $response = $this->actingAs($actor)->get('/transactions?view=recently_completed')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 1)
                ->where('records.data.0.id', $recent->id));

        $this->assertStringNotContainsString($nullCompleted->title, $response->getContent());
    }

    public function test_search_includes_transaction_type_and_existing_search_fields(): void
    {
        $office = $this->department('SEARCH');
        $actor = $this->human('department_head', $office);

        $typeMatch = $this->transaction(
            'Neutral title',
            $office,
            $office,
            $actor,
            dueAt: now()->addDays(2),
            transactionType: 'funding_request',
        );
        $this->transaction(
            'Another neutral title',
            $office,
            $office,
            $actor,
            dueAt: now()->addDays(3),
            transactionType: 'internal_request',
        );

        $this->actingAs($actor)->get('/transactions?view=all&search=funding_request')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'funding_request')
                ->where('records.total', 1)
                ->where('records.data.0.id', $typeMatch->id)
                ->where('records.data.0.transactionType', 'funding_request'));
    }

    public function test_search_status_priority_and_current_office_filters_intersect_authorized_scope(): void
    {
        $own = $this->department('FILTER-OWN');
        $budget = $this->department('FILTER-BUDGET');
        $engineering = $this->department('FILTER-ENG');
        $actor = $this->human('department_head', $own);
        $otherHead = $this->human('department_head', $engineering);
        $budgetStaff = $this->human('department_staff', $budget);

        $match = $this->transaction(
            'Budget Alpha Review',
            $own,
            $budget,
            $actor,
            $budgetStaff->employee,
            now()->addDays(2),
            priority: 'high',
            status: 'for_review',
        );
        $this->transaction(
            'Budget Local Review',
            $budget,
            $own,
            $actor,
            dueAt: now()->addDays(3),
            priority: 'high',
            status: 'for_review',
        );
        $hidden = $this->transaction(
            'Budget Hidden Review',
            $engineering,
            $budget,
            $otherHead,
            $budgetStaff->employee,
            now()->addDay(),
            priority: 'high',
            status: 'for_review',
        );

        $url = '/transactions?view=waiting_on_others&search=budget&status=for_review&priority=high&office_id='.$budget->id;
        $response = $this->actingAs($actor)->get($url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 1)
                ->where('records.data.0.id', $match->id)
                ->where('filters.search', 'budget')
                ->where('filters.status', 'for_review')
                ->where('filters.priority', 'high')
                ->where('filters.office_id', $budget->id));

        $this->assertStringNotContainsString($hidden->title, $response->getContent());
    }

    public function test_high_priority_view_is_rejected_but_priority_filters_continue_to_work(): void
    {
        $office = $this->department('PRIORITY');
        $actor = $this->human('department_head', $office);

        $high = $this->transaction('High priority work', $office, $office, $actor, dueAt: now()->addDays(2), priority: 'high');
        $urgent = $this->transaction('Urgent priority work', $office, $office, $actor, dueAt: now()->addDay(), priority: 'urgent');
        $this->transaction('Normal priority work', $office, $office, $actor, dueAt: now()->addDays(3), priority: 'normal');

        $this->actingAs($actor)
            ->getJson('/transactions?view=high_priority')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('view');

        $this->actingAs($actor)->get('/transactions?view=all&priority=high')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 1)
                ->where('records.data.0.id', $high->id));

        $this->actingAs($actor)->get('/transactions?view=all&priority=urgent')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 1)
                ->where('records.data.0.id', $urgent->id));
    }

    public function test_view_all_capability_allows_authorized_municipality_wide_priority_filtering(): void
    {
        $adminOffice = $this->department('GLOBAL-ADMIN');
        $other = $this->department('GLOBAL-OTHER');
        $target = $this->department('GLOBAL-TARGET');
        $admin = $this->human('system_admin', $adminOffice);
        $creator = $this->human('department_head', $other);
        $targetStaff = $this->human('department_staff', $target);

        $municipal = $this->transaction(
            'Municipality wide urgent item',
            $other,
            $target,
            $creator,
            $targetStaff->employee,
            now()->addDays(2),
            priority: 'urgent',
        );

        $this->actingAs($admin)->get('/transactions?view=all&priority=urgent&office_id='.$target->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('workspace.canViewAll', true)
                ->where('records.total', 1)
                ->where('records.data.0.id', $municipal->id)
                ->has('filterOptions.offices', 3));
    }

    public function test_queue_paginates_server_side_after_authorization_and_all_projection(): void
    {
        $office = $this->department('PAGE');
        $actor = $this->human('department_head', $office);

        foreach (range(1, 26) as $number) {
            $this->transaction(
                "Queue page {$number}",
                $office,
                $office,
                $actor,
                dueAt: now()->addDays(2)->addMinutes($number),
            );
        }

        $this->actingAs($actor)->get('/transactions?view=all&page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('records.total', 26)
                ->where('records.current_page', 2)
                ->where('records.last_page', 2)
                ->has('records.data', 1));
    }

    public function test_existing_transaction_detail_and_transition_actions_remain_unchanged(): void
    {
        $office = $this->department('DETAIL');
        $actor = $this->human('department_head', $office);
        $transaction = $this->transaction(
            'Existing detail action',
            $office,
            $office,
            $actor,
            dueAt: now()->addDays(2),
        );

        $this->actingAs($actor)
            ->get('/transactions/'.$transaction->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Transactions/Show')
                ->where('transaction.id', $transaction->id));

        $this->actingAs($actor)
            ->post('/transactions/'.$transaction->id.'/transition', [
                'action' => 'mark_review',
                'remarks' => 'Existing transition contract remains authoritative.',
            ])
            ->assertRedirect('/transactions/'.$transaction->id);

        $this->assertSame('for_review', $transaction->fresh()->status);
        $this->assertDatabaseHas('transaction_events', [
            'transaction_id' => $transaction->id,
            'action' => 'mark_review',
            'remarks' => 'Existing transition contract remains authoritative.',
        ]);
    }

    private function assertSingleView(User $actor, string $view, WorkflowTransaction $expected): void
    {
        $this->actingAs($actor)->get('/transactions?view='.$view)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.view', $view)
                ->where('records.total', 1)
                ->where('records.data.0.id', $expected->id));
    }

    private function department(string $suffix): Department
    {
        return Department::query()->create([
            'code' => 'QUEUE-'.Str::upper(Str::random(5)).'-'.$suffix,
            'name' => 'Queue '.$suffix,
            'short_name' => 'Q-'.$suffix,
            'branch' => 'executive',
            'office_type' => 'department',
            'sort_order' => 10,
            'is_routable' => true,
            'is_active' => true,
        ]);
    }

    private function human(string $role, Department $department): User
    {
        $user = User::query()->create([
            'name' => 'Queue '.$role.' '.Str::random(5),
            'email' => Str::lower(Str::random(10)).'@example.test',
            'password' => 'password',
            'role' => $role,
            'is_active' => true,
        ]);

        Employee::query()->create([
            'employee_number' => 'QUEUE-EMP-'.Str::upper(Str::random(10)),
            'full_name' => $user->name,
            'work_email' => $user->email,
            'user_id' => $user->id,
            'department_id' => $department->id,
            'position_title' => 'Queue Officer',
            'employment_status' => 'active',
        ]);

        return $user->fresh('employee.department');
    }

    private function transaction(
        string $title,
        Department $origin,
        Department $current,
        User $creator,
        ?Employee $assignee = null,
        $dueAt = null,
        string $priority = 'normal',
        string $status = 'submitted',
        $completedAt = null,
        string $transactionType = 'internal_request',
    ): WorkflowTransaction {
        return WorkflowTransaction::query()->create([
            'reference_no' => 'QUEUE-'.Str::upper(Str::random(12)),
            'transaction_type' => $transactionType,
            'title' => $title,
            'description' => 'Synthetic work queue test transaction.',
            'priority' => $priority,
            'origin_department_id' => $origin->id,
            'current_department_id' => $current->id,
            'created_by_user_id' => $creator->id,
            'assigned_employee_id' => $assignee?->id,
            'status' => $status,
            'received_at' => now()->subHours(4),
            'due_at' => $dueAt,
            'completed_at' => $completedAt,
        ]);
    }
}
