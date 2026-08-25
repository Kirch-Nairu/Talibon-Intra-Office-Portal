<?php

namespace Tests\Feature;

use App\Domain\Integration\IntegrationScope;
use App\Models\CorrespondenceEvent;
use App\Services\CorrespondenceReceiveService;
use App\Services\IntegrationClientService;
use App\Services\IntegrationCredentialService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CorrespondenceTimestampDiagnosticTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_receive_path_preserves_the_frozen_application_instant_after_postgres_round_trip(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-25 08:00:00', 'Asia/Manila'));

        try {
            $sessionTimezone = DB::selectOne("select current_setting('TIMEZONE') as timezone");
            $this->assertSame(config('app.timezone'), $sessionTimezone->timezone);

            $expected = now();
            $client = app(IntegrationClientService::class)->create('Correspondence timestamp diagnostic '.Str::uuid(), 100);
            $issued = app(IntegrationCredentialService::class)->issue($client, [
                IntegrationScope::CorrespondenceReceive->value,
            ]);
            $context = app(IntegrationCredentialService::class)->authenticate($issued->plainTextToken);

            $record = app(CorrespondenceReceiveService::class)->receive(
                $context,
                [
                    'source' => 'partner_system',
                    'channel' => 'api',
                    'sender_name' => 'Timestamp Diagnostic Sender',
                    'subject' => 'Correspondence timestamp persistence diagnostic',
                ],
                (string) Str::uuid(),
            )->fresh();
            $event = CorrespondenceEvent::query()->where('correspondence_record_id', $record->id)->sole();

            $persistedRecordEpoch = (int) DB::table('correspondence_records')
                ->where('id', $record->id)
                ->selectRaw('extract(epoch from received_at)::bigint as epoch')
                ->value('epoch');
            $persistedEventEpoch = (int) DB::table('correspondence_events')
                ->where('id', $event->id)
                ->selectRaw('extract(epoch from occurred_at)::bigint as epoch')
                ->value('epoch');

            $this->assertSame($expected->getTimestamp(), $persistedRecordEpoch);
            $this->assertSame($expected->getTimestamp(), $record->received_at->getTimestamp());
            $this->assertSame($expected->getTimestamp(), $persistedEventEpoch);
            $this->assertSame($expected->getTimestamp(), $event->occurred_at->getTimestamp());
        } finally {
            Carbon::setTestNow();
        }
    }
}
