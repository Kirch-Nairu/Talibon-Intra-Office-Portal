<?php

namespace App\Services;

use App\Models\CorrespondenceEvent;
use App\Models\CorrespondenceRecord;
use App\Models\Document;
use App\Models\DocumentLink;
use App\Models\TransactionEvent;
use App\Models\User;
use App\Models\WorkflowTransaction;
use Illuminate\Database\Eloquent\Relations\Relation;

final class DocumentAccessService
{
    public function __construct(private readonly CorrespondenceAccessDecider $correspondenceAccess)
    {
    }

    public function canDownload(User $actor, Document $document): bool
    {
        if ($document->storage_disk !== (string) config('documents.disk', 'documents')
            || ! $document->storage_path) {
            return false;
        }

        $links = DocumentLink::query()
            ->where('document_id', $document->id)
            ->orderBy('id')
            ->limit(16)
            ->get(['linkable_type', 'linkable_id']);

        $hasCorrespondenceParent = false;
        foreach ($links as $link) {
            $type = Relation::getMorphedModel($link->linkable_type) ?? $link->linkable_type;

            if ($type === CorrespondenceRecord::class) {
                $hasCorrespondenceParent = true;
                $record = CorrespondenceRecord::query()->find($link->linkable_id);
                if ($record && $this->correspondenceAccess->canViewInWorkspace($actor, $record)) {
                    return true;
                }
            }

            if ($type === CorrespondenceEvent::class) {
                $hasCorrespondenceParent = true;
                $event = CorrespondenceEvent::query()->with('correspondence')->find($link->linkable_id);
                if ($event?->correspondence
                    && $this->correspondenceAccess->canViewInWorkspace($actor, $event->correspondence)) {
                    return true;
                }
            }
        }

        if ($hasCorrespondenceParent) {
            return false;
        }

        foreach ($links as $link) {
            $type = Relation::getMorphedModel($link->linkable_type) ?? $link->linkable_type;

            if ($type === WorkflowTransaction::class) {
                $transaction = WorkflowTransaction::query()->find($link->linkable_id);
                if ($transaction && $actor->can('view', $transaction)) {
                    return true;
                }
            }

            if ($type === TransactionEvent::class) {
                $event = TransactionEvent::query()->with('transaction')->find($link->linkable_id);
                if ($event?->transaction && $actor->can('view', $event->transaction)) {
                    return true;
                }
            }
        }

        return false;
    }
}
