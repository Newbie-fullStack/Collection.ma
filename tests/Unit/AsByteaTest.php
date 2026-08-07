<?php

namespace Tests\Unit;

use App\Casts\AsBytea;
use App\Models\VendorApplication;
use PHPUnit\Framework\TestCase;

class AsByteaTest extends TestCase
{
    public function test_cast_resolves_pdo_stream_resource_to_bytes(): void
    {
        $cast = new AsBytea;
        $model = new VendorApplication;

        $resource = fopen('php://memory', 'r+');
        fwrite($resource, hex2bin('ffd8ffe000104a46494600'));
        rewind($resource);

        $result = $cast->get($model, 'cin_recto', $resource, []);

        $this->assertIsString($result);
        $this->assertSame('ffd8ffe000104a46494600', bin2hex($result));
        fclose($resource);
    }

    public function test_cast_passes_null_through(): void
    {
        $cast = new AsBytea;
        $model = new VendorApplication;

        $this->assertNull($cast->get($model, 'cin_recto', null, []));
    }
}
