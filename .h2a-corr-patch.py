from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one replacement, found {count}")
    file.write_text(text.replace(old, new, 1))


def replace_between(path: str, start: str, end: str, new_block: str) -> None:
    file = Path(path)
    text = file.read_text()
    start_at = text.find(start)
    if start_at < 0:
        raise SystemExit(f"{path}: start marker not found: {start!r}")
    end_at = text.find(end, start_at)
    if end_at < 0:
        raise SystemExit(f"{path}: end marker not found: {end!r}")
    file.write_text(text[:start_at] + new_block + text[end_at:])


# Route truth: after ownership transfers, do not redirect the sender into a detail page it no longer owns.
replace_once(
    'app/Http/Controllers/CorrespondenceWorkspaceActionController.php',
    """        return redirect()\n            ->route('correspondence.workspace.show', $correspondence)\n            ->with('success', 'Correspondence routed successfully.');\n""",
    """        return redirect()\n            ->route('correspondence.index')\n            ->with('success', 'Correspondence routed successfully.');\n""",
)

# Navigation truth: expose the already-authorized linked workflow from the existing Next Step panel.
replace_once(
    'resources/js/components/correspondence/CorrespondenceActionPanel.tsx',
    "import { useForm } from '@inertiajs/react';\n",
    "import { Link, useForm } from '@inertiajs/react';\n",
)
replace_once(
    'resources/js/components/correspondence/CorrespondenceActionPanel.tsx',
    """                <p className=\"mt-1 text-[11px] leading-5 text-slate-600 sm:text-sm\">This correspondence is routed but is not yet actionable. Use the linked workflow to complete the existing assignment or review step.</p>\n            </section>\n""",
    """                <p className=\"mt-1 text-[11px] leading-5 text-slate-600 sm:text-sm\">This correspondence is routed but is not yet actionable. Use the linked workflow to complete the existing assignment or review step.</p>\n                <Link\n                    href={linkedWorkflowUrl}\n                    className=\"mt-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:text-xs\"\n                >\n                    Open linked workflow\n                </Link>\n            </section>\n""",
)

# Reuse the hardening carrier on H2A; no new browser job/framework.
replace_once(
    '.github/workflows/stable-baseline-hardening.yml',
    """      - KIRCH-TALIBON-H1A-**\n      - KIRCH-TALIBON-H1B-**\n""",
    """      - KIRCH-TALIBON-H1A-**\n      - KIRCH-TALIBON-H1B-**\n      - KIRCH-TALIBON-H2A-**\n""",
)
replace_once(
    '.github/workflows/stable-baseline-hardening.yml',
    """      startsWith(github.ref_name, 'KIRCH-TALIBON-H1A-') ||\n      startsWith(github.ref_name, 'KIRCH-TALIBON-H1B-')\n""",
    """      startsWith(github.ref_name, 'KIRCH-TALIBON-H1A-') ||\n      startsWith(github.ref_name, 'KIRCH-TALIBON-H1B-') ||\n      startsWith(github.ref_name, 'KIRCH-TALIBON-H2A-')\n""",
)

# Add the timestamp needed by the existing H1 evidence contract for Start Action.
replace_once(
    'tests/Browser/h1-mutation-probe.php',
    """        'municipalReference' => $record?->municipal_reference_no,\n        'eventCount' => $record?->events()->count() ?? 0,\n""",
    """        'municipalReference' => $record?->municipal_reference_no,\n        'actionStartedAt' => $record?->action_started_at?->toIso8601String(),\n        'eventCount' => $record?->events()->count() ?? 0,\n""",
)

# Focused Feature truth: post-route redirect is authorized, ownership moves, and submitted is not actionable until an existing workflow transition prepares it.
replace_once(
    'tests/Feature/CorrespondenceWorkspaceActionsTest.php',
    """        $head = $this->human('department_head', $origin);\n        $record = $this->record(\n            'Classified routing item',\n""",
    """        $head = $this->human('department_head', $origin);\n        $targetHead = $this->human('department_head', $target);\n        $record = $this->record(\n            'Classified routing item',\n""",
)
replace_once(
    'tests/Feature/CorrespondenceWorkspaceActionsTest.php',
    """            ])\n            ->assertRedirect('/correspondence/'.$record->public_id.'/workspace')\n            ->assertSessionHas('success', 'Correspondence routed successfully.');\n""",
    """            ])\n            ->assertRedirect('/correspondence')\n            ->assertSessionHas('success', 'Correspondence routed successfully.');\n""",
)
replace_once(
    'tests/Feature/CorrespondenceWorkspaceActionsTest.php',
    """        $this->assertSame(1, CorrespondenceEvent::query()->where('correspondence_record_id', $record->id)->where('event', 'routed')->count());\n\n        $this->actingAs($head)\n            ->from('/correspondence/'.$record->public_id.'/workspace')\n""",
    """        $this->assertSame(1, CorrespondenceEvent::query()->where('correspondence_record_id', $record->id)->where('event', 'routed')->count());\n\n        $this->actingAs($head)\n            ->get('/correspondence/'.$record->public_id.'/workspace')\n            ->assertForbidden();\n\n        $this->actingAs($targetHead)\n            ->get('/correspondence/'.$record->public_id.'/workspace')\n            ->assertOk()\n            ->assertInertia(fn (Assert $page) => $page\n                ->where('correspondence.lifecycleState', 'routed')\n                ->where('correspondence.accountability.currentOffice.code', $target->code)\n                ->where('correspondence.accountability.workflow.status', 'submitted')\n                ->where('capabilities.canAct', false));\n\n        $this->actingAs($head)\n            ->from('/correspondence/'.$record->public_id.'/workspace')\n""",
)

insert_before = "    public function test_non_actionable_routed_workspace_act_is_rejected_without_state_change(): void\n"
new_test = r'''    public function test_routed_correspondence_becomes_actionable_only_after_existing_workflow_prerequisite(): void
    {
        $origin = $this->department('ACT-FLOW-ORIGIN');
        $target = $this->department('ACT-FLOW-TARGET');
        $originHead = $this->human('department_head', $origin);
        $targetHead = $this->human('department_head', $target);
        $record = $this->record(
            'Routed action prerequisite item',
            CorrespondenceLifecycleState::Classified,
            $origin,
            CorrespondenceClassification::Internal,
        );

        $this->actingAs($originHead)
            ->post('/correspondence/'.$record->public_id.'/workspace/route', [
                'target_department_id' => $target->id,
                'priority' => 'normal',
                'remarks' => 'Route to receiving office for review.',
            ])
            ->assertRedirect('/correspondence');

        $routed = $record->fresh('workflowTransaction');
        $workflow = $routed->workflowTransaction;
        $this->assertInstanceOf(WorkflowTransaction::class, $workflow);
        $this->assertSame(CorrespondenceLifecycleState::Routed, $routed->lifecycle_state);
        $this->assertSame('submitted', $workflow->status);
        $this->assertNull($workflow->assigned_employee_id);
        $this->assertSame($target->id, $workflow->current_department_id);

        $this->actingAs($targetHead)
            ->get('/correspondence/'.$record->public_id.'/workspace')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('capabilities.canAct', false)
                ->where('correspondence.accountability.workflow.status', 'submitted')
                ->where('correspondence.accountability.workflow.currentOffice.code', $target->code));

        $workflowEventsBefore = $workflow->events()->count();
        $this->actingAs($targetHead)
            ->post('/transactions/'.$workflow->id.'/transition', [
                'action' => 'mark_review',
            ])
            ->assertRedirect('/transactions/'.$workflow->id)
            ->assertSessionHas('success', 'Transaction workflow updated.');

        $prepared = $workflow->fresh();
        $this->assertSame('for_review', $prepared->status);
        $this->assertSame($target->id, $prepared->current_department_id);
        $this->assertNull($prepared->assigned_employee_id);
        $this->assertSame($workflowEventsBefore + 1, $prepared->events()->count());

        $this->actingAs($targetHead)
            ->get('/correspondence/'.$record->public_id.'/workspace')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('capabilities.canAct', true)
                ->where('correspondence.accountability.workflow.status', 'for_review'));

        $correspondenceEventsBefore = $record->events()->count();
        $workflowEventsPrepared = $prepared->events()->count();

        $this->actingAs($targetHead)
            ->post('/correspondence/'.$record->public_id.'/workspace/act', [
                'remarks' => 'Receiving office has begun action.',
            ])
            ->assertRedirect('/correspondence/'.$record->public_id.'/workspace')
            ->assertSessionHas('success', 'Correspondence marked in action.');

        $acted = $record->fresh('workflowTransaction');
        $this->assertSame(CorrespondenceLifecycleState::InAction, $acted->lifecycle_state);
        $this->assertNotNull($acted->action_started_at);
        $this->assertSame($correspondenceEventsBefore + 1, $acted->events()->count());
        $this->assertSame('for_review', $acted->workflowTransaction->status);
        $this->assertSame($target->id, $acted->workflowTransaction->current_department_id);
        $this->assertSame($workflowEventsPrepared, $acted->workflowTransaction->events()->count());
        $this->assertSame(1, CorrespondenceEvent::query()
            ->where('correspondence_record_id', $record->id)
            ->where('event', 'in_action')
            ->count());
    }

'''
replace_once('tests/Feature/CorrespondenceWorkspaceActionsTest.php', insert_before, new_test + insert_before)

# Browser route truth and end-to-end legitimate prerequisite flow. Keep exactly-once assertions and remove DEFERRED_H2 only because behavior is now exercised as real H2A acceptance.
route_start = "    await runScenario(engineering.page, {\n      scenario: 'correspondence-route-double-click',"
action_start = "    await runScenario(budget.page, {\n      scenario: 'correspondence-begin-action',"
route_block = r'''    await runScenario(engineering.page, {
      scenario: 'correspondence-route-double-click',
      actor: 'Engineering Department Head',
      mutation: 'Route correspondence with rapid duplicate interaction',
    }, async (row) => {
      const before = probe('correspondence', CORRESPONDENCE_ID);
      row.database.before = before;
      if (!await engineering.page.getByRole('heading', { name: 'Route Correspondence' }).isVisible().catch(() => false)) {
        await engineering.page.goto(`${BASE}/correspondence/${CORRESPONDENCE_ID}/workspace`, { waitUntil: 'domcontentloaded' });
        await appReady(engineering.page);
      }
      await selectByText(engineering.page.getByLabel('Destination Office'), /Budget/i);
      const button = engineering.page.getByRole('button', { name: 'Route Correspondence', exact: true });
      const evidence = await browserMutation(engineering.page, {
        pathMatcher: `/correspondence/${CORRESPONDENCE_ID}/workspace/route`,
        action: () => button.click({ clickCount: 2, delay: 0 }),
      });
      setMutationEvidence(row, evidence);
      await engineering.page.getByText('Correspondence routed successfully.', { exact: true }).waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});
      const ready = await appReady(engineering.page, 2500).catch(() => null);
      const after = probe('correspondence', CORRESPONDENCE_ID);
      row.database.after = after;
      const eventDelta = after.eventCount - before.eventCount;
      const workflowEventDelta = after.workflowEventCount - before.workflowEventCount;
      row.duplicateMutationCount = Math.max(0, eventDelta - 1, workflowEventDelta - 1);

      const successVisible = await engineering.page.getByText('Correspondence routed successfully.', { exact: true }).isVisible().catch(() => false);
      const authorizedDestination = pathOnly(engineering.page.url()) === '/correspondence';
      const denialVisible = await engineering.page.getByRole('heading', { name: /cannot open this page/i }).isVisible().catch(() => false);
      const originStillListsRecord = await engineering.page.getByText('H1 mutation correspondence acceptance', { exact: true }).count() > 0;
      const originReopen = await engineering.context.request.get(`${BASE}/correspondence/${CORRESPONDENCE_ID}/workspace`);

      const budgetRuntime = runtimeByPage.get(budget.page) || [];
      const budgetRuntimeStart = budgetRuntime.length;
      const destinationResponse = await budget.page.goto(`${BASE}/correspondence/${CORRESPONDENCE_ID}/workspace`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const destinationReady = await appReady(budget.page, 2500).catch(() => null);
      const destinationRouted = await budget.page.getByText('Routed', { exact: true }).first().isVisible().catch(() => false);
      const destinationWorkflow = after.workflowReference
        ? await budget.page.getByText(after.workflowReference, { exact: true }).first().isVisible().catch(() => false)
        : false;
      const preparationVisible = await budget.page.getByText('Prepare the linked workflow for action', { exact: true }).isVisible().catch(() => false);
      const destinationRuntimeDelta = budgetRuntime.slice(budgetRuntimeStart);
      const destinationRuntimeClean = destinationRuntimeDelta.every((item) => !['pageerror', 'server-5xx', 'console-runtime-error'].includes(item.type));

      const authoritative = after.lifecycle === 'routed'
        && after.workflowId !== null
        && after.workflowStatus === 'submitted'
        && after.workflowDepartmentCode === 'BUDGET'
        && eventDelta === 1
        && workflowEventDelta === 1;
      const immediate = successVisible
        && authorizedDestination
        && !denialVisible
        && !originStillListsRecord
        && originReopen.status() === 403
        && destinationResponse?.status() === 200
        && destinationRouted
        && destinationWorkflow
        && preparationVisible
        && destinationRuntimeClean
        && !!destinationReady
        && !!ready
        && authoritative;

      row.visibleResult = immediate
        ? 'Routing returns the origin actor to the authorized correspondence inbox while the Budget office immediately owns and can open the routed record.'
        : 'Post-route ownership, authorized destination, or destination-office visibility did not converge immediately.';
      row.immediateConvergence = immediate ? 'PASS' : 'FAIL';
      check(row, 'database-routed-exactly-once', authoritative, JSON.stringify(after));
      check(row, 'origin-post-route-destination-authorized', authorizedDestination && successVisible && !denialVisible, `path=${pathOnly(engineering.page.url())}`);
      check(row, 'origin-no-longer-owns-current-work', !originStillListsRecord && originReopen.status() === 403, `reopenStatus=${originReopen.status()}`);
      check(row, 'destination-office-can-open-routed-record', destinationResponse?.status() === 200 && destinationRouted && destinationWorkflow && preparationVisible && !!destinationReady, `status=${destinationResponse?.status()}`);
      check(row, 'destination-runtime-clean', destinationRuntimeClean, `diagnostics=${destinationRuntimeDelta.length}`);
      check(row, 'no-duplicate-effective-mutation', row.duplicateMutationCount === 0, `duplicateMutationCount=${row.duplicateMutationCount}`);

      await reloadAndVerify(engineering.page, row, async () => {
        const reloadState = probe('correspondence', CORRESPONDENCE_ID);
        row.database.reload = reloadState;
        const stillAuthorized = pathOnly(engineering.page.url()) === '/correspondence';
        const stillAbsent = await engineering.page.getByText('H1 mutation correspondence acceptance', { exact: true }).count() === 0;
        return stillAuthorized
          && stillAbsent
          && reloadState.lifecycle === 'routed'
          && reloadState.workflowStatus === 'submitted'
          && reloadState.workflowDepartmentCode === 'BUDGET'
          && reloadState.eventCount === after.eventCount
          && reloadState.workflowEventCount === after.workflowEventCount;
      });
    });

'''
replace_between('tests/Browser/h1-mutation-readiness.mjs', route_start, action_start, route_block)

memo_start = "    await runScenario(mayor.page, {\n      scenario: 'memorandum-publish',"
action_block = r'''    await runScenario(budget.page, {
      scenario: 'correspondence-begin-action',
      actor: 'Budget Department Head',
      mutation: 'Prepare linked workflow and begin action on routed correspondence',
    }, async (row) => {
      const routed = probe('correspondence', CORRESPONDENCE_ID);
      row.database.before = routed;
      if (routed.lifecycle !== 'routed') throw new Error(`Dependency failed: correspondence lifecycle is ${routed.lifecycle}`);
      if (!routed.workflowId) throw new Error('Dependency failed: linked workflow missing');

      const response = await budget.page.goto(`${BASE}/correspondence/${CORRESPONDENCE_ID}/workspace`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      check(row, 'starting-page-200', response?.status() === 200, `status=${response?.status()}`);
      await appReady(budget.page);

      const startUnavailable = await budget.page.getByRole('button', { name: 'Start Action', exact: true }).count() === 0;
      const preparationVisible = await budget.page.getByText('Prepare the linked workflow for action', { exact: true }).isVisible().catch(() => false);
      const linkedWorkflow = budget.page.getByRole('link', { name: 'Open linked workflow', exact: true }).first();
      const linkVisible = await linkedWorkflow.isVisible().catch(() => false);
      check(row, 'start-action-unavailable-before-prerequisite', startUnavailable && preparationVisible && linkVisible && routed.workflowStatus === 'submitted', JSON.stringify(routed));

      await Promise.all([
        budget.page.waitForURL((url) => url.pathname === `/transactions/${routed.workflowId}`, { timeout: 10000 }),
        linkedWorkflow.click(),
      ]);
      await appReady(budget.page);
      const reviewButton = budget.page.getByRole('button', { name: /Mark for Review/i });
      await reviewButton.waitFor({ state: 'visible', timeout: 5000 });

      const prerequisiteEvidence = await browserMutation(budget.page, {
        pathMatcher: new RegExp(`^/transactions/${routed.workflowId}/transition$`),
        action: () => reviewButton.click(),
      });
      check(row, 'prerequisite-one-request-emitted', prerequisiteEvidence.requests.length === 1, `observed ${prerequisiteEvidence.requests.length} requests`);
      check(row, 'prerequisite-response-success', prerequisiteEvidence.responses[0]?.status >= 200 && prerequisiteEvidence.responses[0]?.status < 400, `status=${prerequisiteEvidence.responses[0]?.status ?? null}`);
      await budget.page.getByText('for review', { exact: true }).first().waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});
      await appReady(budget.page, 2500);

      const prepared = probe('correspondence', CORRESPONDENCE_ID);
      row.database.prerequisite = prepared;
      const prerequisiteWorkflowDelta = prepared.workflowEventCount - routed.workflowEventCount;
      const workflowPrepared = prepared.lifecycle === 'routed'
        && prepared.workflowStatus === 'for_review'
        && prepared.workflowDepartmentCode === 'BUDGET'
        && prerequisiteWorkflowDelta === 1;
      check(row, 'linked-workflow-legitimately-actionable', workflowPrepared, JSON.stringify(prepared));

      await budget.page.goto(`${BASE}/correspondence/${CORRESPONDENCE_ID}/workspace`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await appReady(budget.page);
      const button = budget.page.getByRole('button', { name: 'Start Action', exact: true });
      await button.waitFor({ state: 'visible', timeout: 5000 });
      const beforeAct = probe('correspondence', CORRESPONDENCE_ID);

      const evidence = await browserMutation(budget.page, {
        pathMatcher: `/correspondence/${CORRESPONDENCE_ID}/workspace/act`,
        action: () => button.click(),
      });
      setMutationEvidence(row, evidence);
      await budget.page.getByText('In Action', { exact: true }).first().waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});
      const ready = await appReady(budget.page, 2500).catch(() => null);
      const after = probe('correspondence', CORRESPONDENCE_ID);
      row.database.after = after;
      const eventDelta = after.eventCount - beforeAct.eventCount;
      const workflowEventDelta = after.workflowEventCount - beforeAct.workflowEventCount;
      row.duplicateMutationCount = Math.max(0, eventDelta - 1, workflowEventDelta);
      const visible = await budget.page.getByText('In Action', { exact: true }).first().isVisible().catch(() => false);
      const actionGone = await budget.page.getByRole('button', { name: 'Start Action', exact: true }).count() === 0;
      const immediate = visible
        && actionGone
        && !!ready
        && after.lifecycle === 'in_action'
        && !!after.actionStartedAt
        && after.workflowStatus === 'for_review'
        && after.workflowDepartmentCode === 'BUDGET'
        && eventDelta === 1
        && workflowEventDelta === 0;

      row.visibleResult = visible ? 'In Action lifecycle is visible immediately after the legitimate linked-workflow prerequisite.' : 'In Action lifecycle is not visible immediately.';
      row.immediateConvergence = immediate ? 'PASS' : 'FAIL';
      check(row, 'immediate-authoritative-state', immediate, JSON.stringify(after));
      check(row, 'previous-action-removed', actionGone, 'Start Action remains available');
      check(row, 'action-started-at-populated', !!after.actionStartedAt, `actionStartedAt=${after.actionStartedAt}`);
      check(row, 'exactly-one-correspondence-event-appended', eventDelta === 1, `eventDelta=${eventDelta}`);
      check(row, 'linked-workflow-remains-consistent', after.workflowStatus === 'for_review' && after.workflowDepartmentCode === 'BUDGET' && workflowEventDelta === 0, `workflowEventDelta=${workflowEventDelta}`);
      check(row, 'no-duplicate-effective-mutation', row.duplicateMutationCount === 0, `duplicateMutationCount=${row.duplicateMutationCount}`);

      await reloadAndVerify(budget.page, row, async () => {
        const reloadState = probe('correspondence', CORRESPONDENCE_ID);
        row.database.reload = reloadState;
        return await budget.page.getByText('In Action', { exact: true }).first().isVisible().catch(() => false)
          && await budget.page.getByRole('button', { name: 'Start Action', exact: true }).count() === 0
          && reloadState.lifecycle === 'in_action'
          && !!reloadState.actionStartedAt
          && reloadState.workflowStatus === 'for_review'
          && reloadState.workflowDepartmentCode === 'BUDGET'
          && reloadState.eventCount === after.eventCount
          && reloadState.workflowEventCount === after.workflowEventCount;
      });
    });

'''
replace_between('tests/Browser/h1-mutation-readiness.mjs', action_start, memo_start, action_block)
