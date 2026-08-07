<!DOCTYPE html>
<html lang="{{ $user->langue_preferee === 'ar' ? 'ar' : 'fr' }}" dir="{{ $user->langue_preferee === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body { margin:0; padding:0; background:#f5f2ea; font-family:Arial,Helvetica,sans-serif; color:#2b2b2b; }
        .wrap { max-width:560px; margin:0 auto; padding:24px; }
        .card { background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.06); }
        .head { background:#0f1b2d; padding:24px; color:#c9a15a; font-size:20px; font-weight:700; }
        .body { padding:24px; line-height:1.65; }
        .btn { display:inline-block; margin-top:18px; padding:12px 22px; background:#c9a15a; color:#0f1b2d;
               text-decoration:none; border-radius:8px; font-weight:600; }
        .foot { padding:16px 24px; font-size:12px; color:#8a857d; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <div class="head">Collection.ma</div>
            <div class="body">
                <p>{!! nl2br(e($body)) !!}</p>
                @if($link)
                    <a class="btn" href="{{ $link }}">{{ __('Voir', [], $user->langue_preferee) }}</a>
                @endif
            </div>
            <div class="foot">
                © {{ date('Y') }} Collection.ma
            </div>
        </div>
    </div>
</body>
</html>