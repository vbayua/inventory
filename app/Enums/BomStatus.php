<?php

namespace App\Enums;

enum BomStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Retired = 'retired';

    public function canTransition(self $to): bool
    {
        return in_array($to, match ($this) {
            self::Draft => [self::Active],
            self::Active => [self::Retired],
            self::Retired => [],
        }, true);
    }
}
