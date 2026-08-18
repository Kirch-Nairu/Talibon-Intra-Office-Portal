<?php

namespace App\Services;

use App\Models\Memorandum;
use App\Models\MemoRecipient;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MemorandumService
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function publish(User $actor, array $data): Memorandum
    {
        $actor->loadMissing('employee.department');
        $departmentId = $actor->employee?->department_id;

        if (! $departmentId) {
            throw ValidationException::withMessages(['issuer' => 'The issuing account must have an employee department.']);
        }

        $recipients = $this->resolveRecipients($data['audience_type'], $data['audience_ids'] ?? []);

        if ($recipients->isEmpty()) {
            throw ValidationException::withMessages(['audience_ids' => 'The selected audience has no active employee accounts.']);
        }

        return DB::transaction(function () use ($actor, $data, $departmentId, $recipients): Memorandum {
            $memo = Memorandum::query()->create([
                'memo_number' => $data['memo_number'],
                'title' => $data['title'],
                'body' => $data['body'],
                'issued_by_user_id' => $actor->id,
                'issued_by_department_id' => $departmentId,
                'audience_type' => $data['audience_type'],
                'requires_acknowledgement' => (bool) ($data['requires_acknowledgement'] ?? false),
                'classification' => $data['classification'] ?? 'internal',
                'status' => 'published',
                'published_at' => now(),
                'expires_at' => $data['expires_at'] ?? null,
            ]);

            $now = now();
            foreach ($recipients as $recipient) {
                MemoRecipient::query()->create([
                    'memorandum_id' => $memo->id,
                    'user_id' => $recipient->id,
                    'delivered_at' => $now,
                ]);
            }

            $this->audit->record(
                $actor,
                'memorandum.published',
                "Published {$memo->memo_number} to {$recipients->count()} recipient(s).",
                'allowed',
                Memorandum::class,
                $memo->id,
            );

            return $memo->fresh(['issuer', 'issuingDepartment', 'recipients']);
        });
    }

    private function resolveRecipients(string $audienceType, array $audienceIds): Collection
    {
        $query = User::query()->where('is_active', true)->whereHas('employee', fn ($q) => $q->where('employment_status', 'active'));

        if ($audienceType === 'departments') {
            $query->whereHas('employee', fn ($q) => $q->whereIn('department_id', $audienceIds));
        } elseif ($audienceType === 'employees') {
            $query->whereHas('employee', fn ($q) => $q->whereIn('id', $audienceIds));
        }

        return $query->get();
    }
}
