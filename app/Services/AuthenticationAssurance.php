<?php

namespace App\Services;

use App\Domain\Identity\PrivilegedRolePolicy;
use App\Models\User;
use Illuminate\Http\Request;

final class AuthenticationAssurance
{
    public const SESSION_USER_KEY = 'auth.assurance.mfa_user_id';

    public const SESSION_VERIFIED_AT_KEY = 'auth.assurance.mfa_verified_at';

    public function __construct(private readonly PrivilegedRolePolicy $roles)
    {
    }

    public function requiresMfa(User $user): bool
    {
        return $this->roles->requiresMfa($user);
    }

    public function enrollmentExists(User $user): bool
    {
        return filled($user->mfa_secret) && $user->mfa_confirmed_at !== null;
    }

    public function isSatisfied(Request $request, User $user): bool
    {
        if (! $this->requiresMfa($user)) {
            return true;
        }

        if (! $this->enrollmentExists($user)) {
            return false;
        }

        return (int) $request->session()->get(self::SESSION_USER_KEY) === (int) $user->id
            && $request->session()->has(self::SESSION_VERIFIED_AT_KEY);
    }

    public function markSatisfied(Request $request, User $user): void
    {
        $request->session()->put([
            self::SESSION_USER_KEY => $user->id,
            self::SESSION_VERIFIED_AT_KEY => now()->getTimestamp(),
        ]);
    }

    public function clear(Request $request): void
    {
        $request->session()->forget([
            self::SESSION_USER_KEY,
            self::SESSION_VERIFIED_AT_KEY,
        ]);
    }

    public function requiredRoute(User $user): string
    {
        return $this->enrollmentExists($user) ? 'mfa.challenge' : 'mfa.enroll';
    }
}
