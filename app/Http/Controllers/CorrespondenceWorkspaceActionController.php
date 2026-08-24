<?php

namespace App\Http\Controllers;

use App\Domain\Correspondence\CorrespondenceClassification;
use App\Domain\Integration\IntegrationRequestAttributes;
use App\Http\Requests\CorrespondenceActRequest;
use App\Http\Requests\CorrespondenceClassifyRequest;
use App\Http\Requests\CorrespondenceRouteRequest;
use App\Models\CorrespondenceRecord;
use App\Services\CorrespondenceLifecycleService;
use App\Services\CorrespondenceRoutingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class CorrespondenceWorkspaceActionController extends Controller
{
    public function register(
        Request $request,
        CorrespondenceRecord $correspondence,
        CorrespondenceLifecycleService $lifecycle,
    ): RedirectResponse {
        $lifecycle->register(
            $request->user(),
            $correspondence,
            $this->correlationId($request),
        );

        return redirect()
            ->route('correspondence.workspace.show', $correspondence)
            ->with('success', 'Correspondence registered.');
    }

    public function classify(
        CorrespondenceClassifyRequest $request,
        CorrespondenceRecord $correspondence,
        CorrespondenceLifecycleService $lifecycle,
    ): RedirectResponse {
        $lifecycle->classify(
            $request->user(),
            $correspondence,
            CorrespondenceClassification::from((string) $request->validated('classification')),
            $this->correlationId($request),
            $request->validated('remarks'),
        );

        return redirect()
            ->route('correspondence.workspace.show', $correspondence)
            ->with('success', 'Correspondence classification updated.');
    }

    public function route(
        CorrespondenceRouteRequest $request,
        CorrespondenceRecord $correspondence,
        CorrespondenceRoutingService $routing,
    ): RedirectResponse {
        $routing->route(
            $request->user(),
            $correspondence,
            $request->validated(),
            $this->correlationId($request),
        );

        return redirect()
            ->route('correspondence.workspace.show', $correspondence)
            ->with('success', 'Correspondence routed successfully.');
    }

    public function act(
        CorrespondenceActRequest $request,
        CorrespondenceRecord $correspondence,
        CorrespondenceRoutingService $routing,
    ): RedirectResponse {
        $routing->markInAction(
            $request->user(),
            $correspondence,
            $this->correlationId($request),
            $request->validated('remarks'),
        );

        return redirect()
            ->route('correspondence.workspace.show', $correspondence)
            ->with('success', 'Correspondence marked in action.');
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
