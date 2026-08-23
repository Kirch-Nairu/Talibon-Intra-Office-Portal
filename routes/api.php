<?php

use App\Http\Controllers\Api\V1\IntegrationSelfController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->middleware([
        'integration.correlation',
        'integration.auth',
    ])
    ->group(function (): void {
        Route::get('/integration/self', IntegrationSelfController::class)
            ->middleware([
                'integration.scope:integration.self.read',
                'integration.rate',
                'integration.audit',
            ])
            ->name('api.v1.integration.self');
    });
