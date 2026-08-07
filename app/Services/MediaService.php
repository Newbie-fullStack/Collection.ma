<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Resolve stored file paths into public/CDN URLs.
 * When the CDN disk is configured (CDN_URL set), returns the CDN absolute URL;
 * otherwise falls back to the standard /storage/... URL.
 */
class MediaService
{
    public static function url(?string $path, ?string $disk = null): ?string
    {
        if (! $path) {
            return null;
        }

        $disk = $disk ?: config('filesystems.default');

        if (config('filesystems.disks.cdn.url')) {
            return rtrim(config('filesystems.disks.cdn.url'), '/').'/'.$path;
        }

        $storageUrl = config("filesystems.disks.{$disk}.url", url('/storage'));

        return rtrim($storageUrl, '/').'/'.$path;
    }

    /**
     * Store a file. Returns its path on the configured media disk.
     */
    public static function store($file, string $directory): string
    {
        $disk = env('CDN_DRIVER', 'local') === 's3' ? 's3' : 'public';

        return $file->store($directory, $disk);
    }
}