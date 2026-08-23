<?php

namespace App\Http\Controllers;

use App\Domain\Correspondence\CorrespondenceClassification;
use App\Domain\Integration\IntegrationRequestAttributes;
use App\Http\Requests\CorrespondenceClassifyRequest;
use App\Models\CorrespondenceRecord;
use App\Services\CorrespondenceLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CorrespondenceLifecycleController extends Controller
{
    public function register(
        Request $request,
        CorrespondenceRecord $correspondence,
        CorrespondenceLifecycleService $lifecycle,
    ): JsonResponse {
        $correlationId = $this->correlationId($request);
        $record = $lifecycle->register($request->user(), $correspondence, $correlationId);

        return response()->json([
            'correspondence' => [
                'public_id' => $record->public_id,
                'reference' => $record->municipal_reference_no,
                'lifecycle_state' => $record->lifecycle_state->value,
                'registered_at' => $record->registered_at?->toISOString(),
            ],
            'correlation_id' => $correlationId,
        ]);
    }

    public function classify(
        CorrespondenceClassifyRequest $request,
        CorrespondenceRecord $correspondence,
        CorrespondenceLifecycleService $lifecycle,
    ): JsonResponse {
        $correlationId = $this->correlationId($request);
        $classification = CorrespondenceClassification::from(
            (string) $request->validated('classification'),
        );

        $record = $lifecycle->classify(
            $request->user(),
            $correspondence,
            $classification,
            $correlationId,
            $request->validated('remarks'),
        );

        return response()->json([
            'correspondence' => [
                'public_id' => $record->public_id,
                'reference' => $record->municipal_reference_no,
                'lifecycle_state' => $record->lifecycle_state->value,
                'classification' => $record->classification?->value,
                'classified_at' => $record->classified_at?->toISOString(),
            ],
            'correlation_id' => $correlationId,
        ]);
    }

    private function correlationId(Request $request): string
    {
        $existing = $request->attributes->get(IntegrationRequestAttributes::CORRELATION_ID);
        if (is_string($existing) && Str::isUuid($existing)) {
            return $existing;
        }

        $correlationId = (string) Str::uuid();
        $request->attributes->set(IntegrationRequestAttributes::CORRELATION_ID, $correlationId);

        return $correlationId;
    }
}
