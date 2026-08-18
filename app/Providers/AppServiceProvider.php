<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Module bindings will be registered here or in dedicated providers.
    }

    public function boot(): void
    {
        // Security and model policy bootstrapping will be expanded in M1/M2.
    }
}
