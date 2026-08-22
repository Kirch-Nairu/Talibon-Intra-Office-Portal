<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Str;

class AuditLogger
{
    public function record(
        ?User $actor,
        string $action,
        string $summary,
        string $outcome = 'allowed',
        ?string $entityType = null,
        ?int $entityId = null,
    ): AuditLog {
        return AuditLog::query()->create([
            'actor_user_id' => $actor?->id,
            'actor_department_id' => $actor?->employee?->department_id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'outcome' => $outcome,
            'summary' => $summary,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'correlation_id' => (string) Str::uuid(),
            'created_at' => now(),
        ]);
    }

    public function recordAnonymous(
        string $action,
        string $summary,
        string $outcome = 'denied',
        ?string $entityType = null,
    ): AuditLog {
        return $this->record(null, $action, $summary, $outcome, $entityType);
    }
}
