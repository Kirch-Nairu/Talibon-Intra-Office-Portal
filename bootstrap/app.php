<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RequireActiveAccount;
use App\Http\Middleware\RequireHrisAdmin;
use App\Http\Middleware\RequireMfaAssurance;
use App\Http\Middleware\RequireMfaSubject;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [HandleInertiaRequests::class]);
        $middleware->alias([
            'active' => RequireActiveAccount::class,
            'mfa.assured' => RequireMfaAssurance::class,
            'mfa.subject' => RequireMfaSubject::class,
            'hris.admin' => RequireHrisAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
    })->create();
