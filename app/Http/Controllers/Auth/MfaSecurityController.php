<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\AuthenticationAssurance;
use App\Services\MfaRecoveryCodeBroker;
use App\Services\MfaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class MfaSecurityController extends Controller
{
    public function __construct(
        private readonly AuthenticationAssurance $assurance,
        private readonly MfaService $mfa,
        private readonly MfaRecoveryCodeBroker $recoveryBroker,
        private readonly AuditLogger $audit,
    ) {
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Auth/MfaSettings', [
            'configured' => $this->assurance->enrollmentExists($request->user()),
            'confirmedAt' => $request->user()->mfa_confirmed_at?->toIso8601String(),
            'recoveryGeneratedAt' => $request->user()->mfa_recovery_codes_generated_at?->toIso8601String(),
        ]);
    }

    public function recovery(Request $request): Response|RedirectResponse
    {
        $sealed = $request->session()->pull('mfa_recovery_codes_sealed');
        $codes = $this->recoveryBroker->open(is_string($sealed) ? $sealed : null);

        if ($codes === []) {
            return redirect()->route('mfa.settings');
        }

        return Inertia::render('Auth/MfaRecoveryCodes', [
            'codes' => $codes,
            'continueUrl' => $request->session()->get('url.intended', route('dashboard')),
        ]);
    }

    public function regenerateRecoveryCodes(Request $request): RedirectResponse
    {
        $user = $request->user();
        $codes = $this->mfa->regenerateRecoveryCodes($user);
        $this->audit->record($user, 'auth.mfa.recovery_codes.regenerated', 'MFA recovery codes were regenerated.');

        return redirect()->route('mfa.recovery.show')->with(
            'mfa_recovery_codes_sealed',
            $this->recoveryBroker->seal($codes),
        );
    }

    public function reset(Request $request): RedirectResponse
    {
        $user = $request->user();
        $this->mfa->resetEnrollment($user);
        $this->assurance->clear($request);
        $this->audit->record($user, 'auth.mfa.reset', 'Privileged MFA enrollment was reset.');

        return redirect()->route('mfa.enroll');
    }

    public function disable(Request $request): RedirectResponse
    {
        $user = $request->user();
        $this->mfa->disable($user);
        $this->assurance->clear($request);
        $this->audit->record($user, 'auth.mfa.disabled', 'Privileged MFA enrollment was disabled.');

        return redirect()->route('mfa.enroll')->with('success', 'MFA was disabled. Re-enrollment is required before municipal access resumes.');
    }
}
