<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Seeder;

class WorkflowDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (WorkflowTransaction::query()->exists()) {
            return;
        }

        $engineering = Department::query()->where('code', 'ENG')->firstOrFail();
        $budget = Department::query()->where('code', 'BUDGET')->firstOrFail();
        $accounting = Department::query()->where('code', 'ACCOUNTING')->firstOrFail();
        $mayor = Department::query()->where('code', 'MAYOR')->firstOrFail();
        $engineeringUser = User::query()->where('email', 'engineering@talibon.demo')->firstOrFail();
        $budgetUser = User::query()->where('email', 'budget@talibon.demo')->firstOrFail();

        $samples = [
            ['title' => 'Road Rehabilitation Funding Request', 'type' => 'funding_request', 'priority' => 'high', 'origin' => $engineering->id, 'current' => $mayor->id, 'status' => 'for_approval', 'creator' => $engineeringUser->id],
            ['title' => 'Municipal Equipment Acquisition', 'type' => 'project_endorsement', 'priority' => 'normal', 'origin' => $budget->id, 'current' => $mayor->id, 'status' => 'for_review', 'creator' => $budgetUser->id],
            ['title' => 'Drainage Improvement Cost Review', 'type' => 'funding_request', 'priority' => 'urgent', 'origin' => $engineering->id, 'current' => $budget->id, 'status' => 'for_review', 'creator' => $engineeringUser->id],
            ['title' => 'Engineering Program Financial Validation', 'type' => 'document_review', 'priority' => 'normal', 'origin' => $engineering->id, 'current' => $accounting->id, 'status' => 'submitted', 'creator' => $engineeringUser->id],
        ];

        foreach ($samples as $sample) {
            $transaction = WorkflowTransaction::query()->create([
                'transaction_type' => $sample['type'],
                'title' => $sample['title'],
                'description' => 'Synthetic prototype transaction used to demonstrate inter-office municipal routing.',
                'priority' => $sample['priority'],
                'origin_department_id' => $sample['origin'],
                'current_department_id' => $sample['current'],
                'created_by_user_id' => $sample['creator'],
                'status' => $sample['status'],
            ]);

            $transaction->update(['reference_no' => sprintf('TAL-2026-%06d', $transaction->id)]);

            TransactionEvent::query()->create([
                'transaction_id' => $transaction->id,
                'actor_user_id' => $sample['creator'],
                'from_department_id' => $sample['origin'],
                'to_department_id' => $sample['current'],
                'action' => 'submitted',
                'previous_status' => 'draft',
                'new_status' => $sample['status'],
                'remarks' => 'Seeded prototype routing event.',
                'created_at' => now()->subMinutes(random_int(20, 300)),
            ]);
        }
    }
}
