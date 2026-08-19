<?php

namespace App\Services;

use App\Models\CalendarEvent;
use App\Models\WorkflowTransaction;

class CalendarService
{
    public function syncTransactionDue(WorkflowTransaction $transaction): ?CalendarEvent
    {
        if (! $transaction->due_at) {
            return null;
        }

        $transaction->loadMissing('assignedEmployee');
        $terminal = in_array($transaction->status, ['approved', 'disapproved', 'closed'], true);

        return CalendarEvent::query()->updateOrCreate(
            ['event_key' => 'transaction-due-'.$transaction->id],
            [
                'event_type' => 'workflow_deadline',
                'title' => $transaction->reference_no.' due · '.$transaction->title,
                'description' => 'Action deadline for a routed municipal transaction.',
                'scope' => 'department',
                'department_id' => $transaction->current_department_id,
                'user_id' => $transaction->assignedEmployee?->user_id,
                'source_domain' => 'transaction',
                'source_type' => WorkflowTransaction::class,
                'source_id' => $transaction->id,
                'priority' => $transaction->priority,
                'starts_at' => $transaction->due_at,
                'all_day' => false,
                'action_url' => '/transactions/'.$transaction->id,
                'status' => $terminal ? 'completed' : 'scheduled',
                'created_by_user_id' => $transaction->created_by_user_id,
            ],
        );
    }
}
