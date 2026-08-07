<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AsBytea implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null) {
            return null;
        }

        if (DB::getDriverName() === 'pgsql' && is_string($value) && str_starts_with($value, '\\x')) {
            $hex = substr($value, 2);

            return hex2bin($hex) ?: $value;
        }

        return $value;
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null) {
            return null;
        }

        if (DB::getDriverName() === 'pgsql') {
            return '\\x'.bin2hex((string) $value);
        }

        return $value;
    }
}
