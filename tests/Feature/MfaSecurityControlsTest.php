<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuthenticationAssurance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class MfaSecurityControlsTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'Municipal-Test-2026!';

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_deactivated_authenticated_session_is_forced_out_and_audited(): void
    {
        $user = $this->user('employee');
        $this->actingAs($user);
        $user->update(['is_active' => false]);

        $this->get('/dashboard')->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $user->id,
            'action' => 'auth.account.deactivated_forced_logout',
            'outcome' => 'denied',
        ]);
    }

    public function test_mfa_middleware_blocks_direct_privileged_route_bypass(): void
    {
        $user = $this->configuredPrivilegedUser();

        Auth::guard('web')->login($user);
        $this->get('/transactions')->assertRedirect(route('mfa.challenge'));

        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $user->id,
            'action' => 'auth.assurance.denied',
            'outcome' => 'denied',
        ]);
    }

    public function test_password_login_and_mfa_challenge_are_rate_limited(): void
    {
        $ordinary = $this->user('employee');

        foreach (range(1, 5) as $_) {
            $this->post('/login', ['email' => $ordinary->email, 'password' => 'wrong-password']);
        }

        $this->post('/login', ['email' => $ordinary->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors('email');
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.login.rate_limited']);

        Cache::flush();
        $privileged = $this->configuredPrivilegedUser();
        Auth::guard('web')->login($privileged);
        $current = $this->totp()->getCurrentOtp($privileged->mfa_secret);
        $invalid = $current === '000000' ? '000001' : '000000';

        foreach (range(1, 5) as $_) {
            $this->post('/security/mfa/challenge', ['code' => $invalid]);
        }

        $this->post('/security/mfa/challenge', ['code' => $invalid])
            ->assertSessionHasErrors('code');
        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $privileged->id,
            'action' => 'auth.mfa.challenge.rate_limited',
        ]);
    }

    public function test_mfa_secret_and_recovery_material_are_not_exposed_or_stored_in_plaintext(): void
    {
        $user = $this->configuredPrivilegedUser();
        $secret = $user->mfa_secret;
        $serialized = $user->fresh()->toArray();

        $this->assertArrayNotHasKey('mfa_secret', $serialized);
        $this->assertArrayNotHasKey('mfa_recovery_codes', $serialized);
        $this->assertNotSame($secret, DB::table('users')->where('id', $user->id)->value('mfa_secret'));

        $this->actingAs($user)
            ->withSession($this->assuredSession($user))
            ->get('/security/mfa')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/MfaSettings')
                ->missing('secret')
                ->missing('mfa_secret')
                ->missing('mfa_recovery_codes')
                ->missing('auth.user.mfa_secret')
                ->missing('auth.user.mfa_recovery_codes'));
    }

    public function test_mfa_reset_and_disable_operations_are_audited_and_restrict_access(): void
    {
        $user = $this->configuredPrivilegedUser();

        $this->actingAs($user)
            ->withSession($this->assuredSession($user))
            ->post('/security/mfa/reset')
            ->assertRedirect(route('mfa.enroll'));
        $this->assertDatabaseHas('audit_logs', ['actor_user_id' => $user->id, 'action' => 'auth.mfa.reset']);
        $this->assertNull($user->fresh()->mfa_confirmed_at);

        $this->configure($user);
        $this->withSession($this->assuredSession($user))
            ->delete('/security/mfa')
            ->assertRedirect(route('mfa.enroll'));
        $this->assertDatabaseHas('audit_logs', ['actor_user_id' => $user->id, 'action' => 'auth.mfa.disabled']);
        $this->assertNull($user->fresh()->mfa_secret);
    }

    public function test_success_failure_recovery_and_assurance_events_leave_audit_evidence_without_secrets(): void
    {
        $user = $this->configuredPrivilegedUser();
        $secret = $user->mfa_secret;
        Auth::guard('web')->login($user);

        $invalid = $this->totp()->getCurrentOtp($secret) === '000000' ? '000001' : '000000';
        $this->post('/security/mfa/challenge', ['code' => $invalid]);
        $this->post('/security/mfa/challenge', ['code' => $this->totp()->getCurrentOtp($secret)]);

        $actions = AuditLog::query()->where('actor_user_id', $user->id)->pluck('action')->all();
        $this->assertContains('auth.mfa.challenge.failed', $actions);
        $this->assertContains('auth.mfa.challenge.succeeded', $actions);
        $this->assertContains('auth.assurance.satisfied', $actions);
        $this->assertStringNotContainsString($secret, AuditLog::query()->pluck('summary')->implode('\n'));
    }

    private function configuredPrivilegedUser(): User
    {
        $user = $this->user('system_admin');
        $this->configure($user);

        return $user->fresh();
    }

    private function configure(User $user): void
    {
        $user->forceFill([
            'mfa_secret' => $this->totp()->generateSecretKey(),
            'mfa_confirmed_at' => now(),
            'mfa_recovery_codes' => [],
            'mfa_recovery_codes_generated_at' => now(),
        ])->save();
    }

    private function user(string $role): User
    {
        return User::query()->create([
            'name' => 'Security Test User',
            'email' => Str::uuid().'@example.test',
            'password' => self::PASSWORD,
            'role' => $role,
            'is_active' => true,
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function assuredSession(User $user): array
    {
        return [
            AuthenticationAssurance::SESSION_USER_KEY => $user->id,
            AuthenticationAssurance::SESSION_VERIFIED_AT_KEY => now()->getTimestamp(),
        ];
    }

    private function totp(): Google2FA
    {
        return app(Google2FA::class);
    }
}
