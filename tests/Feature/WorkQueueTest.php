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

    public function test_default_needs_my_action_uses_existing_assignment_and_office_scope_without_leaking_unrelated_work(): void
    {
        $office = $this->department('OWN');
        $otherOffice = $this->department('OTHER');
        $thirdOffice = $this->department('THIRD');
        $actor = $this->human('department_head', $office);
        $otherStaff = $this->human('department_staff', $office);
        $mine = $this->transaction('Assigned directly to me', $office, $office, $actor, dueAt: now()->addDays(2));
        $unassigned = $this->transaction('Unassigned office work', $otherOffice, $office, $actor, dueAt: now()->addDays(3));
        $this->transaction('Assigned to another officer', $otherOffice, $office, $actor, $otherStaff->employee, now()->addDays(4));
        $this->transaction('Waiting in another office', $office, $otherOffice, $actor, dueAt: now()->addDays(5));
        $hidden = $this->transaction('Unrelated hidden transaction', $otherOffice, $thirdOffice, $this->human('department_head', $otherOffice), dueAt: now()->addDays(2));

        $response = $this->actingAs($actor)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Transactions/Index')
                ->where('filters.view', 'needs_my_action')
                ->where('records.total', 2)
                ->where('records.data.0.id', $mine->id)
                ->where('records.data.0.requiresAction', true)
                ->where('records.data.1.id', $unassigned->id)
                ->where('records.data.1.requiresAction', true)
                ->where('views.0.key', 'needs_my_action')
                ->where('views.0.count', 2)
                ->where('workspace.canViewAll', false));

        $this->assertStringNotContainsString($hidden->title, $response->getContent());
        $this->assertStringNotContainsString((string) $hidden->reference_no, $response->getContent());
    }

    public function test_named_queue_views_project_existing_workflow_fields_without_task_domain(): void
    {
        $office = $this->department('QUEUE');
        $otherOffice = $this->department('QUEUE-OTHER');
        $actor = $this->human('department_head', $office);
        $officeStaff = $this->human('department_staff', $office);
        $otherStaff = $this->human('department_staff', $otherOffice);

        $mine = $this->transaction('Mine', $office, $office, $actor, $actor->employee, now()->addDays(3));
        $this->transaction('Other assigned office item', $otherOffice, $office, $actor, $officeStaff->employee, now()->addDays(4));
        $unassigned = $this->transaction('Unassigned', $otherOffice, $office, $actor, dueAt: now()->addDays(5));
        $overdue = $this->transaction('Overdue', $otherOffice, $office, $actor, $officeStaff->employee, now()->subDay());
        $dueSoon = $this->transaction('Due soon', $otherOffice, $office, $actor, $officeStaff->employee, now()->addHours(6));
        $high = $this->transaction('Urgent elsewhere', $office, $otherOffice, $actor, $otherStaff->employee, now()->addDays(2), priority: 'urgent');
        $this->transaction('Waiting elsewhere', $office, $otherOffice, $actor, $otherStaff->employee, now()->addDays(6));
        $completed = $this->transaction(
            'Recently completed',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDay(),
            status: 'approved',
            completedAt: now()->subDays(3),
        );
        $this->transaction(
            'Old completed',
            $office,
            $office,
            $actor,
            $actor->employee,
            now()->subDays(60),
            status: 'approved',
            completedAt: now()->subDays(60),
        );

        $this->assertSingleView($actor, 'assigned_to_me', $mine);
        $this->actingAs($actor)->get('/transactions?view=office_queue')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('records.total', 5));
        $this->assertSingleView($actor, 'unassigned', $unassigned);
        $this->assertSingleView($actor, 'overdue', $overdue);
        $this->assertSingleView($actor, 'due_soon', $dueSoon);
        $this->assertSingleView($actor, 'high_priority', $high);
        $this->actingAs($actor)->get('/transactions?view=waiting_on_others')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('records.total', 2));
        $this->assertSingleView($actor, 'recently_completed', $completed);
    }

    public function test_search_status_priority_and_current_office_filters_intersect_authorized_scope(): void
    {
        $own = $this->department('FILTER-OWN');
        $budget = $this->department('FILTER-BUDGET');
        $engineering = $this->department('FILTER-ENG');
        $actor = $this->human('department_head', $own);
        $otherHead = $this->human('department_head', $engineering);
        $budgetStaff = $this->human('department_staff', $budget);
        $engineeringStaff = $this->human('department_staff', $engineering);

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
        $this->transaction(
            'Engineering Gamma',
            $own,
            $engineering,
            $actor,
            $engineeringStaff->employee,
            now()->addDays(4),
            priority: 'normal',
            status: 'submitted',
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
                ->where('filters.office_id', $budget->id)
                ->has('filterOptions.offices', 3));

        $this->assertStringNotContainsString($hidden->title, $response->getContent());
    }

    public function test_view_all_capability_allows_authorized_municipality_wide_queue_filtering(): void
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

        $this->actingAs($admin)->get('/transactions?view=high_priority&office_id='.$target->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('workspace.canViewAll', true)
                ->where('records.total', 1)
                ->where('records.data.0.id', $municipal->id)
                ->has('filterOptions.offices', 3));
    }

    public function test_queue_paginates_server_side_after_authorization_and_view_projection(): void
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

        $this->actingAs($actor)->get('/transactions?view=needs_my_action&page=2')
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
    ): WorkflowTransaction {
        return WorkflowTransaction::query()->create([
            'reference_no' => 'QUEUE-'.Str::upper(Str::random(12)),
            'transaction_type' => 'internal_request',
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
