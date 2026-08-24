<?php

namespace Tests\Feature;

use App\Domain\Correspondence\CorrespondenceClassification;
use App\Domain\Correspondence\CorrespondenceLifecycleState;
use App\Models\CorrespondenceRecord;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_normal_portal_auth_active_and_mfa_assurance(): void
    {
        $office = $this->department('ACCESS');

        $this->get('/dashboard')->assertRedirect('/login');

        $inactive = $this->human('department_head', $office, false);
        Auth::guard('web')->login($inactive);
        $this->get('/dashboard')->assertRedirect('/login');

        $mfaPending = $this->human('department_head', $office);
        Auth::guard('web')->login($mfaPending);
        $this->get('/dashboard')->assertRedirect(route('mfa.enroll'));
    }

    public function test_department_metrics_match_my_work_semantics_and_ignore_unrelated_transactions(): void
    {
        $own = $this->department('OWN');
        $other = $this->department('OTHER');
        $third = $this->department('THIRD');
        $actor = $this->human('department_head', $own);
        $officeStaff = $this->human('department_staff', $own);
        $otherStaff = $this->human('department_staff', $other);
        $otherHead = $this->human('department_head', $other);

        $this->transaction('Mine active', $own, $own, $actor, $actor->employee, now()->addDays(2));
        $this->transaction('Office unassigned', $other, $own, $actor, null, now()->addDays(2));
        $this->transaction('Due soon office item', $other, $own, $actor, $officeStaff->employee, now()->addHours(6));
        $this->transaction('Waiting and overdue', $own, $other, $actor, $otherStaff->employee, now()->subDay());
        $this->transaction(
            'Completed current month',
            $own,
            $own,
            $actor,
            $actor->employee,
            now()->subDays(2),
            status: 'approved',
            completedAt: now()->subDay(),
        );
        $legacyTerminal = $this->transaction(
            'Terminal without completion timestamp',
            $own,
            $own,
            $actor,
            $actor->employee,
            now()->subDays(2),
            status: 'approved',
            completedAt: null,
        );
        $legacyTerminal->touch();

        $this->transaction(
            'Unrelated overdue',
            $other,
            $third,
            $otherHead,
            $otherStaff->employee,
            now()->subDays(2),
        );

        $this->actingAs($actor)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('workspace.departmentName', $own->name)
                ->where('workspace.canSeeMunicipalOverview', false)
                ->where('departmentMetrics.requiresMyAction.value', 1)
                ->where('departmentMetrics.requiresMyAction.link', '/transactions?view=needs_my_action')
                ->where('departmentMetrics.pendingInMyOffice.value', 3)
                ->where('departmentMetrics.pendingInMyOffice.link', '/transactions?view=office_queue')
                ->where('departmentMetrics.unassignedInMyOffice.value', 1)
                ->where('departmentMetrics.overdue.value', 1)
                ->where('departmentMetrics.waitingOnOtherOffices.value', 1)
                ->where('departmentMetrics.dueSoon.value', 1)
                ->where('departmentMetrics.completedThisMonth.value', 1)
                ->missing('municipalOverview')
                ->missing('departmentWorkload'));
    }

    public function test_correspondence_status_attention_and_recent_lists_respect_existing_visibility(): void
    {
        $own = $this->department('CORR-OWN');
        $other = $this->department('CORR-OTHER');
        $staff = $this->human('department_staff', $own);

        $intake = $this->correspondence(
            'Fresh RECEIVE intake',
            null,
            null,
            CorrespondenceLifecycleState::Received,
            receivedAt: now()->subMinutes(5),
        );
        $registered = $this->correspondence(
            'Registered office matter',
            $own,
            null,
            CorrespondenceLifecycleState::Registered,
            receivedAt: now()->subMinutes(15),
        );
        $routedWorkflow = $this->transaction(
            'Routed correspondence workflow',
            $own,
            $own,
            $staff,
            $staff->employee,
            now()->addDay(),
            transactionType: 'document_review',
            status: 'for_review',
        );
        $routed = $this->correspondence(
            'Recently routed visible matter',
            $own,
            CorrespondenceClassification::Internal,
            CorrespondenceLifecycleState::InAction,
            $routedWorkflow,
            now()->subMinutes(30),
            now()->subMinutes(10),
        );
        $awaitingWorkflow = $this->transaction(
            'Awaiting correspondence action',
            $own,
            $own,
            $staff,
            $staff->employee,
            now()->addDay(),
            transactionType: 'document_review',
            status: 'for_review',
        );
        $this->correspondence(
            'Routed awaiting action',
            $own,
            CorrespondenceClassification::Internal,
            CorrespondenceLifecycleState::Routed,
            $awaitingWorkflow,
            now()->subMinutes(25),
            now()->subMinutes(20),
        );
        $confidential = $this->correspondence(
            'Confidential hidden matter',
            $own,
            CorrespondenceClassification::Confidential,
            CorrespondenceLifecycleState::Classified,
            receivedAt: now()->subMinute(),
        );
        $restricted = $this->correspondence(
            'Restricted hidden matter',
            $own,
            CorrespondenceClassification::Restricted,
            CorrespondenceLifecycleState::Classified,
            receivedAt: now()->subMinutes(2),
        );
        $otherOffice = $this->correspondence(
            'Other office hidden routed matter',
            $other,
            CorrespondenceClassification::Internal,
            CorrespondenceLifecycleState::Routed,
            receivedAt: now()->subMinutes(3),
            routedAt: now()->subMinute(),
        );

        $response = $this->actingAs($staff)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('correspondenceAttention.value', 2)
                ->where('correspondenceAttention.link', '/correspondence?action_required=1')
                ->where('correspondenceStatus.0.lifecycle', 'received')
                ->where('correspondenceStatus.0.count', 1)
                ->where('correspondenceStatus.1.lifecycle', 'registered')
                ->where('correspondenceStatus.1.count', 1)
                ->where('correspondenceStatus.2.lifecycle', 'classified')
                ->where('correspondenceStatus.2.count', 0)
                ->where('correspondenceStatus.3.lifecycle', 'routed')
                ->where('correspondenceStatus.3.count', 1)
                ->where('correspondenceStatus.4.lifecycle', 'in_action')
                ->where('correspondenceStatus.4.count', 1)
                ->has('correspondenceStatus', 5)
                ->where('correspondenceStatus.0.link', '/correspondence?lifecycle=received')
                ->where('recentlyReceivedCorrespondence.0.subject', $intake->subject)
                ->where('recentlyRoutedCorrespondence.0.subject', $routed->subject)
                ->where('recentlyRoutedCorrespondence.0.detailUrl', '/correspondence/'.$routed->public_id.'/workspace'));

        foreach ([$confidential, $restricted, $otherOffice] as $hidden) {
            $this->assertStringNotContainsString($hidden->subject, $response->getContent());
            $this->assertStringNotContainsString($hidden->public_id, $response->getContent());
        }

        $this->assertStringContainsString($registered->subject, $response->getContent());
    }

    public function test_system_admin_transaction_oversight_does_not_expand_correspondence_visibility(): void
    {
        $adminOffice = $this->department('ADMIN');
        $other = $this->department('ADMIN-OTHER');
        $mayor = $this->department('MAYOR-OFFICE', code: 'MAYOR');
        $admin = $this->human('system_admin', $adminOffice);
        $otherHead = $this->human('department_head', $other);

        $this->transaction('Municipal visible transaction', $other, $mayor, $otherHead, dueAt: now()->addDays(2));
        $restricted = $this->correspondence(
            'Restricted other-office correspondence',
            $other,
            CorrespondenceClassification::Restricted,
            CorrespondenceLifecycleState::Classified,
        );

        $response = $this->actingAs($admin)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('workspace.canSeeMunicipalOverview', true)
                ->where('municipalOverview.activeMunicipalWork', 1)
                ->where('municipalOverview.executiveQueue', 1)
                ->where('correspondenceStatus.0.count', 0)
                ->where('correspondenceStatus.1.count', 0)
                ->where('correspondenceStatus.2.count', 0)
                ->where('correspondenceStatus.3.count', 0)
                ->where('correspondenceStatus.4.count', 0)
                ->has('recentlyReceivedCorrespondence', 0)
                ->has('recentlyRoutedCorrespondence', 0));

        $this->assertStringNotContainsString($restricted->subject, $response->getContent());
    }

    public function test_recent_work_is_authorized_and_uses_existing_detail_urls_and_due_states(): void
    {
        $own = $this->department('RECENT-OWN');
        $other = $this->department('RECENT-OTHER');
        $third = $this->department('RECENT-THIRD');
        $actor = $this->human('department_head', $own);
        $otherHead = $this->human('department_head', $other);

        $visible = $this->transaction(
            'Visible recent work',
            $own,
            $other,
            $actor,
            dueAt: now()->subHour(),
            transactionType: 'funding_request',
        );
        $hidden = $this->transaction(
            'Hidden recent work',
            $other,
            $third,
            $otherHead,
            dueAt: now()->subHour(),
        );

        $response = $this->actingAs($actor)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('recentWork.0.reference', $visible->reference_no)
                ->where('recentWork.0.transactionType', 'Funding Request')
                ->where('recentWork.0.dueState', 'overdue')
                ->where('recentWork.0.detailUrl', '/transactions/'.$visible->id));

        $this->assertStringNotContainsString($hidden->title, $response->getContent());
    }

    public function test_view_all_actor_receives_exact_municipal_metrics_and_grouped_office_workload(): void
    {
        $adminOffice = $this->department('EXEC-ADMIN');
        $mayor = $this->department('EXEC-MAYOR', code: 'MAYOR');
        $budget = $this->department('EXEC-BUDGET');
        $engineering = $this->department('EXEC-ENG');
        $admin = $this->human('system_admin', $adminOffice);
        $creator = $this->human('department_head', $budget);
        $engineer = $this->human('department_staff', $engineering);

        $this->transaction('Mayor queue item', $budget, $mayor, $creator, null, now()->addHours(8));
        $this->transaction('Engineering overdue', $budget, $engineering, $creator, $engineer->employee, now()->subDay());
        $this->transaction('Engineering unassigned', $budget, $engineering, $creator, null, now()->addDays(3));
        $this->transaction(
            'Completed this month',
            $engineering,
            $budget,
            $creator,
            $engineer->employee,
            now()->subDays(2),
            status: 'approved',
            completedAt: now()->subDay(),
        );
        $legacy = $this->transaction(
            'Legacy terminal no completion',
            $engineering,
            $budget,
            $creator,
            $engineer->employee,
            now()->subDays(2),
            status: 'approved',
            completedAt: null,
        );
        $legacy->touch();

        $this->actingAs($admin)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('workspace.canSeeMunicipalOverview', true)
                ->where('workspace.departmentCode', $adminOffice->code)
                ->where('municipalOverview.activeMunicipalWork', 3)
                ->where('municipalOverview.municipalOverdue', 1)
                ->where('municipalOverview.municipalUnassigned', 2)
                ->where('municipalOverview.dueSoon', 1)
                ->where('municipalOverview.executiveQueue', 1)
                ->where('municipalOverview.completedThisMonth', 1)
                ->where('departmentWorkload.0.code', $engineering->code)
                ->where('departmentWorkload.0.active', 2)
                ->where('departmentWorkload.0.unassigned', 1)
                ->where('departmentWorkload.0.overdue', 1)
                ->where('departmentWorkload.1.code', 'MAYOR')
                ->where('departmentWorkload.1.active', 1)
                ->where('departmentWorkload.1.unassigned', 1)
                ->where('departmentWorkload.1.dueSoon', 1));
    }

    public function test_dashboard_deep_links_and_parked_scope_remain_current_only(): void
    {
        $office = $this->department('LINKS');
        $actor = $this->human('department_head', $office);

        $this->actingAs($actor)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('departmentMetrics.requiresMyAction.link', '/transactions?view=needs_my_action')
                ->where('departmentMetrics.pendingInMyOffice.link', '/transactions?view=office_queue')
                ->where('departmentMetrics.overdue.link', '/transactions?view=overdue')
                ->where('departmentMetrics.waitingOnOtherOffices.link', '/transactions?view=waiting_on_others')
                ->where('departmentMetrics.unassignedInMyOffice.link', '/transactions?view=unassigned')
                ->where('correspondenceAttention.link', '/correspondence?action_required=1'));

        $pageSource = file_get_contents(resource_path('js/pages/Dashboard.tsx'));
        $querySource = file_get_contents(app_path('Services/DashboardWorkspaceQuery.php'))
            .file_get_contents(app_path('Services/DashboardTransactionQuery.php'))
            .file_get_contents(app_path('Services/DashboardCorrespondenceQuery.php'));

        $this->assertIsString($pageSource);
        $this->assertStringContainsString('href="/records"', $pageSource);
        $this->assertStringContainsString('href="/correspondence"', $pageSource);
        $this->assertStringContainsString('href="/transactions"', $pageSource);

        foreach ([
            'Hris',
            'Legislative',
            'Property',
            'Payroll',
            'Dtr',
            'Asset',
            'Procurement',
            'ProjectMonitoring',
        ] as $parked) {
            $this->assertStringNotContainsString($parked, $querySource);
        }

        foreach (['For Review', 'Incoming', 'High Priority', 'Approved Today'] as $oldMetric) {
            $this->assertStringNotContainsString($oldMetric, $pageSource);
        }
    }

    private function department(string $suffix, ?string $code = null): Department
    {
        return Department::query()->create([
            'code' => $code ?? 'DASH-'.Str::upper(Str::random(5)).'-'.$suffix,
            'name' => 'Dashboard '.$suffix,
            'short_name' => 'D-'.$suffix,
            'branch' => 'executive',
            'office_type' => 'department',
            'sort_order' => 10,
            'is_routable' => true,
            'is_active' => true,
        ]);
    }

    private function human(string $role, Department $department, bool $active = true): User
    {
        $user = User::query()->create([
            'name' => 'Dashboard '.$role.' '.Str::random(5),
            'email' => Str::lower(Str::random(10)).'@example.test',
            'password' => 'password',
            'role' => $role,
            'is_active' => $active,
        ]);

        Employee::query()->create([
            'employee_number' => 'DASH-EMP-'.Str::upper(Str::random(10)),
            'full_name' => $user->name,
            'work_email' => $user->email,
            'user_id' => $user->id,
            'department_id' => $department->id,
            'position_title' => 'Dashboard Officer',
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
        string $transactionType = 'internal_request',
        string $status = 'submitted',
        $completedAt = null,
    ): WorkflowTransaction {
        return WorkflowTransaction::query()->create([
            'reference_no' => 'DASH-TX-'.Str::upper(Str::random(10)),
            'transaction_type' => $transactionType,
            'title' => $title,
            'description' => 'Synthetic dashboard test transaction.',
            'priority' => 'normal',
            'origin_department_id' => $origin->id,
            'current_department_id' => $current->id,
            'created_by_user_id' => $creator->id,
            'assigned_employee_id' => $assignee?->id,
            'status' => $status,
            'received_at' => now()->subHours(2),
            'due_at' => $dueAt ?? now()->addDays(3),
            'completed_at' => $completedAt,
        ]);
    }

    private function correspondence(
        string $subject,
        ?Department $department,
        ?CorrespondenceClassification $classification = CorrespondenceClassification::Internal,
        CorrespondenceLifecycleState $state = CorrespondenceLifecycleState::Classified,
        ?WorkflowTransaction $workflow = null,
        $receivedAt = null,
        $routedAt = null,
    ): CorrespondenceRecord {
        return CorrespondenceRecord::query()->create([
            'public_id' => (string) Str::uuid(),
            'external_reference_no' => 'DASH-EXT-'.Str::upper(Str::random(10)),
            'source' => 'email',
            'channel' => 'dashboard_test',
            'sender_name' => 'Dashboard Sender',
            'sender_organization' => 'Dashboard Source Office',
            'subject' => $subject,
            'summary' => 'Synthetic dashboard correspondence.',
            'received_at' => $receivedAt ?? now()->subHours(3),
            'receiving_department_id' => $department?->id,
            'municipal_reference_no' => $state === CorrespondenceLifecycleState::Received
                ? null
                : 'DASH-COR-'.Str::upper(Str::random(10)),
            'classification' => $classification?->value,
            'lifecycle_state' => $state->value,
            'workflow_transaction_id' => $workflow?->id,
            'routed_at' => $routedAt,
        ]);
    }
}
