<?php

namespace App\Domain\Integration;

enum IntegrationErrorCode: string
{
    case AuthenticationFailed = 'integration_authentication_failed';
    case ScopeDenied = 'integration_scope_denied';
    case RateLimited = 'integration_rate_limited';
    case RequestInvalid = 'integration_request_invalid';

    public function message(): string
    {
        return match ($this) {
            self::AuthenticationFailed => 'The integration credential could not be authenticated.',
            self::ScopeDenied => 'The client is not permitted to perform this operation.',
            self::RateLimited => 'The client has exceeded its request limit.',
            self::RequestInvalid => 'The integration request is invalid.',
        };
    }
}
