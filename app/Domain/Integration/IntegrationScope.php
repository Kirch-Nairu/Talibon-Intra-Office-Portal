<?php

namespace App\Domain\Integration;

enum IntegrationScope: string
{
    case SelfRead = 'integration.self.read';
    case ProofWrite = 'integration.proof.write';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $scope): string => $scope->value,
            self::cases(),
        );
    }
}
