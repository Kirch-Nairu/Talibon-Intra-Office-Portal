<?php

namespace App\Providers;

use App\Http\Controllers\LegislativeWorkspaceController;
use App\Models\WorkflowTransaction;
use App\Policies\TransactionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Gate::policy(WorkflowTransaction::class, TransactionPolicy::class);

        Route::middleware(['web', 'auth'])->group(function (): void {
            Route::get('/legislative-workspace', [LegislativeWorkspaceController::class, 'index'])->name('legislative.workspace');
            Route::post('/legislative-workspace/sessions', [LegislativeWorkspaceController::class, 'store'])->name('legislative.sessions.store');
            Route::post('/legislative-workspace/sessions/{session}/agenda', [LegislativeWorkspaceController::class, 'addAgenda'])->name('legislative.agenda.store');
        });
    }
}
