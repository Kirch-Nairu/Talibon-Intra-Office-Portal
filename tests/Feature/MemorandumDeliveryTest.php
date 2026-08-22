<?php

namespace Tests\Feature;

use App\Models\Memorandum;
use App\Models\MemoRecipient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemorandumDeliveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_mayor_can_publish_and_employee_can_view_and_acknowledge(): void
    {
        $this->seed();

        $mayor = User::query()->where('email', 'mayor@talibon.demo')->firstOrFail();
        $employee = User::query()->where('email', 'employee@talibon.demo')->firstOrFail();

        $this->actingAs($mayor)
            ->post('/memoranda', [
                'memo_number' => 'MEMO-TEST-001',
                'title' => 'Automated Memorandum Delivery Proof',
                'body' => 'Synthetic memorandum used by the feature test.',
                'audience_type' => 'all',
                'audience_ids' => [],
                'requires_acknowledgement' => true,
                'classification' => 'internal',
                'expires_at' => null,
            ])
            ->assertRedirect();

        $memo = Memorandum::query()->where('memo_number', 'MEMO-TEST-001')->firstOrFail();
        $recipient = MemoRecipient::query()
            ->where('memorandum_id', $memo->id)
            ->where('user_id', $employee->id)
            ->firstOrFail();

        $this->assertNotNull($recipient->delivered_at);
        $this->assertNull($recipient->viewed_at);
        $this->assertNull($recipient->acknowledged_at);

        $this->actingAs($employee)
            ->get("/memoranda/{$memo->id}")
            ->assertOk();

        $this->assertNotNull($recipient->fresh()->viewed_at);

        $this->actingAs($employee)
            ->post("/memoranda/{$memo->id}/acknowledge")
            ->assertRedirect();

        $this->assertNotNull($recipient->fresh()->acknowledged_at);
        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $employee->id,
            'action' => 'memorandum.acknowledged',
            'outcome' => 'allowed',
        ]);
    }
}
