from pathlib import Path

TEST = Path('tests/Feature/MfaSecurityControlsTest.php')
DOC = Path('docs/ENGINEERING_LOG.md')


def replace_between(text: str, start: str, end: str, replacement: str) -> str:
    start_at = text.index(start)
    end_at = text.index(end, start_at)
    return text[:start_at] + replacement.rstrip() + '\n\n' + text[end_at:]


test = TEST.read_text()

test = replace_between(
    test,
    '    public function test_old_assured_session_is_invalid_after_other_session_reset_and_reenrollment(): void\n',
    '    public function test_sensitive_enrollment_response_disables_caching_and_encrypts_inertia_history(): void\n',
    '''    public function test_old_assured_session_is_invalid_after_other_session_reset_and_reenrollment(): void
    {
        $user = $this->configuredPrivilegedUser();
        $sessionA = $this->assuredSession($user->fresh());
        $oldVersion = (int) $sessionA[AuthenticationAssurance::SESSION_VERSION_KEY];

        $this->actingAs($user)
            ->withSession($sessionA)
            ->get('/dashboard')
            ->assertOk();

        $newSecret = app(MfaService::class)->resetEnrollment($user);
        $afterReset = $user->fresh();
        $this->assertGreaterThan($oldVersion, (int) $afterReset->mfa_version);

        Auth::guard('web')->login($afterReset);
        $this->withSession($sessionA)
            ->get('/dashboard')
            ->assertRedirect(route('mfa.enroll'));

        $newProof = app(MfaService::class)->confirmEnrollment(
            $afterReset,
            $this->totp()->getCurrentOtp($newSecret),
        );
        $this->assertInstanceOf(ConfirmedMfaEnrollment::class, $newProof);
        $reenrolled = $user->fresh();
        $this->assertGreaterThan((int) $afterReset->mfa_version, (int) $reenrolled->mfa_version);
        $this->assertNotNull($reenrolled->mfa_confirmed_at);

        Auth::guard('web')->login($reenrolled);
        $this->withSession($sessionA)
            ->get('/dashboard')
            ->assertRedirect(route('mfa.challenge'));
    }''',
)

test = replace_between(
    test,
    '    public function test_sensitive_enrollment_response_disables_caching_and_encrypts_inertia_history(): void\n',
    '    public function test_recovery_codes_use_one_time_inertia_flash_and_sensitive_response_headers(): void\n',
    '''    public function test_sensitive_enrollment_response_disables_caching_and_encrypts_inertia_history(): void
    {
        $user = $this->user('system_admin');
        $this->post('/login', ['email' => $user->email, 'password' => self::PASSWORD]);

        $response = $this->get('/security/mfa/enroll');

        $response->assertOk()
            ->assertInertia(function (Assert $page): void {
                $page->component('Auth/MfaEnrollment')
                    ->has('secret')
                    ->has('provisioningUri')
                    ->missing('mfa_recovery_codes');
                $this->assertTrue($page->toArray()['encryptHistory'] ?? false);
            });
        $this->assertSensitiveCacheHeaders($response);
    }''',
)

test = replace_between(
    test,
    '    public function test_recovery_codes_use_one_time_inertia_flash_and_sensitive_response_headers(): void\n',
    '    private function configuredPrivilegedUser(): User\n',
    '''    public function test_recovery_codes_use_one_time_inertia_flash_and_sensitive_response_headers(): void
    {
        $user = $this->configuredPrivilegedUser();
        $codes = ['ONETIME-ALPHA1', 'ONETIME-BRAVO2'];
        $sealed = app(MfaRecoveryCodeBroker::class)->seal($codes);
        Auth::guard('web')->login($user);

        $response = $this->withSession([
            ...$this->assuredSession($user),
            'mfa_recovery_codes_sealed' => $sealed,
        ])->get('/security/mfa/recovery-codes');

        $response->assertOk()
            ->assertInertia(function (Assert $page) use ($codes): void {
                $page->component('Auth/MfaRecoveryCodes')
                    ->hasFlash('mfaRecoveryCodes', $codes)
                    ->missing('codes')
                    ->missing('mfaRecoveryCodes')
                    ->has('continueUrl');
                $this->assertTrue($page->toArray()['encryptHistory'] ?? false);
            });
        $this->assertSensitiveCacheHeaders($response);

        $this->get('/security/mfa/recovery-codes')
            ->assertRedirect(route('mfa.settings'));
    }''',
)

TEST.write_text(test)

doc = DOC.read_text()
heading = '### `test: correct MFA security regression harness`'
if heading in doc:
    raise SystemExit('corrective engineering-log entry already exists')

entry = '''

### `test: correct MFA security regression harness`
- Scope: focused MFA test-harness correction on parent `b2d3687020ae1c14dd8950657c716692ce25db2d`; production MFA services, middleware, controllers, route ordering, epoch/version semantics, and sensitive-response behavior are intentionally unchanged.
- Parent runtime evidence supplied by Kirch: Composer install PASS; Composer validate PASS; Composer audit PASS with no advisories; npm install PASS; additive MFA-version migration PASS; `PrivilegedMfaAuthenticationTest` PASS. Parent `b2d3687` is not green because `MfaSecurityControlsTest` failed.
- Exact focused diagnostic rerun: **MfaSecurityControlsTest: 2 failed / 8 passed / 1 pending / 61 assertions**. The earlier full run exposed **3 failures / 8 passed / 62 assertions** because the recovery-code test also hit the same incomplete Inertia-request HTTP 409 condition. Both are failure evidence, not PASS evidence.
- Harness corrections: the stale-session regression now takes a deterministic epoch-N snapshot from `assuredSession($user->fresh())` instead of assuming `session()->only(...)` captured the post-challenge version key. The sensitive enrollment and recovery-code tests now use normal initial Inertia responses with `assertInertia`; recovery-code flash uses the supported Inertia v3 `hasFlash()` assertion. No Inertia asset-version negotiation is bypassed or disabled.
- Verification for this corrective tree: __FOCUSED_RESULT__
- Next action: after this corrective commit is pushed, Kirch may resume the exact-HEAD MFA closure pipeline. No full Phase 1 runtime PASS is claimed by this entry.
'''
marker = '\n## Current release state'
if marker not in doc:
    raise SystemExit('engineering-log release-state marker not found')
doc = doc.replace(marker, entry + marker, 1)
DOC.write_text(doc)

# Contents-API update used only to trigger the isolated temporary branch workflow.
