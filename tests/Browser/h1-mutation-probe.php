<?php

declare(strict_types=1);

use App\Domain\Correspondence\CorrespondenceLifecycleState;
use App\Models\AuditLog;
use App\Models\CorrespondenceRecord;
use App\Models\Memorandum;
use App\Models\MemoRecipient;
use App\Models\TransactionEvent;
use App\Models\TravelOrder;
use App\Models\WorkflowTransaction;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';

$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

const H1_DATABASE = 'talibon_h1_mutations';
const H1_CORRESPONDENCE_ID = '11000000-0000-4000-8000-000000000001';

if (! app()->environment('testing')) {
    fwrite(STDERR, "H1 mutation probe is testing-only.\n");
    exit(2);
}

$database = DB::connection()->getDatabaseName();
if ($database !== H1_DATABASE) {
    fwrite(STDERR, "H1 mutation probe requires the isolated H1 database.\n");
    exit(2);
}

$command = $argv[1] ?? '';
$args = array_slice($argv, 2);

$output = match ($command) {
    'isolation' => isolationSnapshot($database),
    'setup' => setupFixtures(),
    'totals' => totalsSnapshot(),
    'transaction' => transactionSnapshot($args[0] ?? ''),
    'correspondence' => correspondenceSnapshot($args[0] ?? H1_CORRESPONDENCE_ID),
    'memorandum' => memorandumSnapshot($args[0] ?? '', $args[1] ?? ''),
    'travel' => travelSnapshot($args[0] ?? ''),
    default => null,
};

if ($output === null) {
    fwrite(STDERR, "Unknown H1 mutation probe command.\n");
    exit(2);
}

echo json_encode($output, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES).PHP_EOL;

function isolationSnapshot(string $database): array
{
    return [
        'environment' => app()->environment(),
        'database' => $database,
        'isolated' => app()->environment('testing') && $database === H1_DATABASE,
    ];
}

function setupFixtures(): array
{
    return DB::transaction(function (): array {
        $existing = CorrespondenceRecord::query()->where('public_id', H1_CORRESPONDENCE_ID)->first();
        if ($existing) {
            $workflowId = $existing->workflow_transaction_id;
            $existing->events()->delete();
            $existing->delete();

            if ($workflowId) {
                TransactionEvent::query()->where('transaction_id', $workflowId)->delete();
                WorkflowTransaction::query()->whereKey($workflowId)->delete();
            }
        }

        CorrespondenceRecord::query()->create([
            'public_id' => H1_CORRESPONDENCE_ID,
            'external_reference_no' => 'H1-BROWSER-INPUT-001',
            'source' => 'official_email',
            'channel' => 'email',
            'sender_name' => 'Synthetic H1 QA Sender',
            'sender_organization' => 'Synthetic QA Fixture',
            'subject' => 'H1 mutation correspondence acceptance',
            'summary' => 'Testing-only correspondence used for isolated browser mutation acceptance.',
            'received_at' => now(),
            'lifecycle_state' => CorrespondenceLifecycleState::Received,
            'workflow_transaction_id' => null,
            'receiving_department_id' => null,
        ]);

        return [
            'ok' => true,
            'correspondencePublicId' => H1_CORRESPONDENCE_ID,
            'database' => DB::connection()->getDatabaseName(),
        ];
    });
}

function totalsSnapshot(): array
{
    return [
        'transactions' => WorkflowTransaction::query()->count(),
        'correspondence' => CorrespondenceRecord::query()->count(),
        'memoranda' => Memorandum::query()->count(),
        'travelOrders' => TravelOrder::query()->count(),
    ];
}

function transactionSnapshot(string $title): array
{
    $query = WorkflowTransaction::query()->where('title', $title);
    $count = (clone $query)->count();
    $transaction = $query->with('currentDepartment:id,code')->orderBy('id')->first();

    return [
        'count' => $count,
        'id' => $transaction?->id,
        'reference' => $transaction?->reference_no,
        'status' => $transaction?->status,
        'currentDepartmentCode' => $transaction?->currentDepartment?->code,
        'eventCount' => $transaction?->events()->count() ?? 0,
    ];
}

function correspondenceSnapshot(string $publicId): array
{
    $query = CorrespondenceRecord::query()->where('public_id', $publicId);
    $count = (clone $query)->count();
    $record = $query->with('workflowTransaction.currentDepartment:id,code')->first();
    $workflow = $record?->workflowTransaction;

    return [
        'count' => $count,
        'lifecycle' => $record?->lifecycle_state?->value,
        'classification' => $record?->classification?->value,
        'municipalReference' => $record?->municipal_reference_no,
        'eventCount' => $record?->events()->count() ?? 0,
        'workflowId' => $workflow?->id,
        'workflowReference' => $workflow?->reference_no,
        'workflowStatus' => $workflow?->status,
        'workflowDepartmentCode' => $workflow?->currentDepartment?->code,
        'workflowEventCount' => $workflow?->events()->count() ?? 0,
    ];
}

function memorandumSnapshot(string $memoNumber, string $recipientEmail): array
{
    $query = Memorandum::query()->where('memo_number', $memoNumber);
    $count = (clone $query)->count();
    $memorandum = $query->orderBy('id')->first();
    $recipient = null;

    if ($memorandum && $recipientEmail !== '') {
        $recipient = MemoRecipient::query()
            ->where('memorandum_id', $memorandum->id)
            ->whereHas('user', fn ($user) => $user->where('email', $recipientEmail))
            ->first();
    }

    return [
        'count' => $count,
        'id' => $memorandum?->id,
        'recipientCount' => $memorandum?->recipients()->count() ?? 0,
        'acknowledgedCount' => $memorandum?->recipients()->whereNotNull('acknowledged_at')->count() ?? 0,
        'targetAcknowledged' => $recipient?->acknowledged_at !== null,
        'ackAuditCount' => $memorandum
            ? AuditLog::query()
                ->where('action', 'memorandum.acknowledged')
                ->where('entity_type', Memorandum::class)
                ->where('entity_id', $memorandum->id)
                ->count()
            : 0,
    ];
}

function travelSnapshot(string $reference): array
{
    $query = TravelOrder::query()->where('reference_number', $reference);
    $count = (clone $query)->count();
    $travelOrder = $query->orderBy('id')->first();

    return [
        'count' => $count,
        'publicId' => $travelOrder?->public_id,
        'status' => $travelOrder?->status?->value,
        'eventCount' => $travelOrder?->events()->count() ?? 0,
        'issuedToCount' => $travelOrder?->issuedTo()->count() ?? 0,
    ];
}
