<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkflowTransaction;

class TransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active && $user->employee !== null;
    }

    public function view(User $user, WorkflowTransaction $transaction): bool
    {
        if ($user->isRole('system_admin', 'mayor_approver', 'mayor_staff')) {
            return true;
        }

        $departmentId = $user->employee?->department_id;

        return $departmentId !== null && in_array($departmentId, [
            $transaction->origin_department_id,
            $transaction->current_department_id,
        ], true);
    }

    public function create(User $user): bool
    {
        return $user->is_active && $user->employee !== null;
    }

    public function transition(User $user, WorkflowTransaction $transaction): bool
    {
        if ($user->isRole('system_admin')) {
            return true;
        }

        if ($user->isRole('mayor_approver')) {
            return false;
        }

        return $user->employee?->department_id === $transaction->current_department_id
            && $user->isRole('department_head', 'department_staff', 'hr_officer', 'legislative_staff', 'mayor_staff');
    }

    public function assign(User $user, WorkflowTransaction $transaction): bool
    {
        if ($user->isRole('system_admin')) {
            return true;
        }

        return $user->employee?->department_id === $transaction->current_department_id
            && $user->isRole('department_head', 'hr_officer', 'legislative_staff', 'mayor_staff');
    }

    public function mayorDecision(User $user, WorkflowTransaction $transaction): bool
    {
        if ($user->isRole('system_admin')) {
            return true;
        }

        return $user->isRole('mayor_approver')
            && $user->employee?->department?->code === 'MAYOR'
            && $transaction->currentDepartment?->code === 'MAYOR';
    }
}
