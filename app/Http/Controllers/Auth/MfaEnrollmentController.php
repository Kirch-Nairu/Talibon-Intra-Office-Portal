<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\AuthenticationAssurance;
use App\Services\AuthenticationAttemptLimiter;
use App\Services\MfaRecoveryCodeBroker;
use App\Services\MfaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class MfaEnrollmentController extends Controller
{
    public function __construct(
        private readonly AuthenticationAssurance $assurance,
        private readonly AuthenticationAttemptLimiter $limiter,
        private readonly MfaService $mfa,
        private readonly MfaRecoveryCodeBroker $recoveryBroker,
        private readonly AuditLogger $audit,
    ) {
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $this->assurance->requiresMfa($user)) {
            return redirect()->route('dashboard');
        }

        if ($this->assurance->enrollmentExists($user)) {
            return redirect()->route($this->assurance->isSatisfied($request, $user) ? 'mfa.settings' : 'mfa.challenge');
        }

        $newEnrollment = blank($user->mfa_secret);
        $secret = $this->mfa->ensureEnrollmentSecret($user);

        if ($newEnrollment) {
            $this->audit->record($user, 'auth.mfa.enrollment.started', 'Privileged MFA enrollment was initialized.');
        }

        return Inertia::render('Auth/MfaEnrollment', [
            'secret' => $secret,
            'provisioningUri' => $this->mfa->provisioningUri($user->fresh()),
            'issuer' => config('identity.mfa.issuer'),
        ]);
    }

    public function confirm(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $this->assurance->requiresMfa($user)) {
            return redirect()->route('dashboard');
        }

        if ($this->assurance->enrollmentExists($user)) {
            return redirect()->route($this->assurance->isSatisfied($request, $user) ? 'mfa.settings' : 'mfa.challenge');
        }

        $data = $request->validate(['code' => ['required', 'digits:6']]);
        $this->rejectLimitedAttempt($request);
        $codes = $this->mfa->confirmEnrollment($user, $data['code']);

        if ($codes === null) {
            $this->limiter->hitMfa($request, $user);
            $this->audit->record($user, 'auth.mfa.enrollment_confirmation_failed', 'MFA enrollment confirmation failed.', 'denied');
            throw ValidationException::withMessages(['code' => 'The verification code could not be accepted.']);
        }

        $this->limiter->clearMfa($request, $user);
        $request->session()->regenerate();
        $this->assurance->markSatisfied($request, $user);
        $this->audit->record($user, 'auth.mfa.enrollment.confirmed', 'Privileged MFA enrollment was confirmed.');
        $this->audit->record($user, 'auth.assurance.satisfied', 'Required privileged MFA assurance was satisfied after enrollment.');

        return redirect()->route('mfa.recovery.show')->with(
            'mfa_recovery_codes_sealed',
            $this->recoveryBroker->seal($codes),
        );
    }

    private function rejectLimitedAttempt(Request $request): void
    {
        $user = $request->user();

        if (! $this->limiter->mfaLimited($request, $user)) {
            return;
        }

        $this->audit->record($user, 'auth.mfa.enrollment.rate_limited', 'MFA enrollment confirmation was rate limited.', 'denied');
        throw ValidationException::withMessages(['code' => 'Verification could not be completed. Please wait and try again.']);
    }
}
