<?php

namespace App\Services;

use App\Domain\Correspondence\CorrespondenceClassification;
use App\Domain\Correspondence\CorrespondenceLifecycleState;
use App\Models\CorrespondenceRecord;
use App\Models\IntegrationClient;
use App\Models\User;

class CorrespondenceAccessDecider
{
    private const REGISTER_ROLES = [
        'department_head',
        'department_staff',
        'mayor_approver',
        'mayor_staff',
        'hr_officer',
        'legislative_staff',
    ];

    private const CLASSIFY_ROLES = [
        'department_head',
        'mayor_approver',
        'hr_officer',
        'legislative_staff',
    ];

    private const ROUTE_ROLES = [
        'department_head',
        'mayor_approver',
        'hr_officer',
        'legislative_staff',
    ];

    private const ACTION_ROLES = [
        'department_head',
        'department_staff',
        'mayor_approver',
        'mayor_staff',
        'hr_officer',
        'legislative_staff',
    ];

    private const CONFIDENTIAL_VIEW_ROLES = [
        'department_head',
        'mayor_approver',
        'hr_officer',
        'legislative_staff',
    ];

    private const RESTRICTED_VIEW_ROLES = [
        'department_head',
        'mayor_approver',
    ];

    public function canRegister(User $actor, CorrespondenceRecord $record): bool
    {
        return $record->lifecycle_state === CorrespondenceLifecycleState::Received
            && $this->hasActiveMunicipalIdentity($actor)
            && in_array($actor->role, self::REGISTER_ROLES, true);
    }

    public function canClassify(User $actor, CorrespondenceRecord $record): bool
    {
        return $record->lifecycle_state === CorrespondenceLifecycleState::Registered
            && $this->hasOfficeOrAssignmentContext($actor, $record)
            && in_array($actor->role, self::CLASSIFY_ROLES, true);
    }

    public function canRoute(User $actor, CorrespondenceRecord $record): bool
    {
        return $record->lifecycle_state === CorrespondenceLifecycleState::Classified
            && $record->workflow_transaction_id === null
            && in_array($actor->role, self::ROUTE_ROLES, true)
            && $this->canView($actor, $record);
    }

    public function canAct(User $actor, CorrespondenceRecord $record): bool
    {
        return $record->lifecycle_state === CorrespondenceLifecycleState::Routed
            && $record->workflow_transaction_id !== null
            && in_array($actor->role, self::ACTION_ROLES, true)
            && $this->canView($actor, $record);
    }

    public function canView(User $actor, CorrespondenceRecord $record): bool
    {
        if (! $this->hasOfficeOrAssignmentContext($actor, $record)) {
            return false;
        }

        $classification = $record->classification;
        if (! $classification instanceof CorrespondenceClassification
            || in_array($classification, [
                CorrespondenceClassification::Public,
                CorrespondenceClassification::Internal,
            ], true)) {
            return in_array($actor->role, self::REGISTER_ROLES, true);
        }

        if ($classification === CorrespondenceClassification::Confidential) {
            return in_array($actor->role, self::CONFIDENTIAL_VIEW_ROLES, true);
        }

        return in_array($actor->role, self::RESTRICTED_VIEW_ROLES, true);
    }

    public function canIntegrationReadStatus(
        IntegrationClient $client,
        CorrespondenceRecord $record,
    ): bool {
        return (int) $record->receiving_integration_client_id === (int) $client->id;
    }

    private function hasOfficeOrAssignmentContext(User $actor, CorrespondenceRecord $record): bool
    {
        if (! $this->hasActiveMunicipalIdentity($actor)) {
            return false;
        }

        $record->loadMissing('workflowTransaction');
        $workflow = $record->workflowTransaction;
        if ($workflow !== null && $workflow->assigned_employee_id !== null) {
            if ((int) $workflow->assigned_employee_id === (int) $actor->employee->id) {
                return true;
            }
        }

        $officeId = $workflow?->current_department_id ?? $record->receiving_department_id;

        return $officeId !== null
            && (int) $actor->employee->department_id === (int) $officeId;
    }

    private function hasActiveMunicipalIdentity(User $actor): bool
    {
        $actor->loadMissing('employee');

        return $actor->is_active
            && $actor->employee !== null
            && $actor->employee->employment_status === 'active'
            && $actor->employee->department_id !== null;
    }
}
