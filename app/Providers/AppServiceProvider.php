<?php

namespace App\Providers;

use App\Models\WorkflowTransaction;
use App\Policies\TransactionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Gate::policy(WorkflowTransaction::class, TransactionPolicy::class);
    }
}
