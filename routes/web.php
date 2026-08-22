<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DtrController;
use App\Http\Controllers\EmployeeDirectoryController;
use App\Http\Controllers\EmployeeHealthVaultController;
use App\Http\Controllers\EmployeeProfileController;
use App\Http\Controllers\HealthAccessController;
use App\Http\Controllers\HrisAdminController;
use App\Http\Controllers\HrisController;
use App\Http\Controllers\HrisDevelopmentController;
use App\Http\Controllers\HrisLifecycleController;
use App\Http\Controllers\HrisOffboardingController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LegislativeRecordController;
use App\Http\Controllers\MayorOfficeController;
use App\Http\Controllers\MemorandumController;
use App\Http\Controllers\OperationsMonitoringController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PlatformNotificationController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/departments', DepartmentController::class)->name('departments.index');
    Route::get('/employees', EmployeeDirectoryController::class)->name('employees.index');
    Route::get('/employees/{employee}', EmployeeProfileController::class)->name('employees.show');
    Route::get('/calendar', CalendarController::class)->name('calendar.index');
    Route::get('/operations', OperationsMonitoringController::class)->name('operations.index');
    Route::get('/property', [PropertyController::class, 'index'])->name('property.index');
    Route::post('/property', [PropertyController::class, 'store'])->name('property.store');
    Route::post('/property/{asset}/assign', [PropertyController::class, 'assign'])->name('property.assign');
    Route::post('/property/{asset}/return', [PropertyController::class, 'returnAsset'])->name('property.return');
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/export/{report}', [ReportsController::class, 'export'])->name('reports.export');

    Route::post('/notifications/{notification}/read', [PlatformNotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/{notification}/acknowledge', [PlatformNotificationController::class, 'acknowledge'])->name('notifications.acknowledge');

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/create', [TransactionController::class, 'create'])->name('transactions.create');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('/transactions/{transaction}/transition', [TransactionController::class, 'transition'])->name('transactions.transition');

    Route::get('/mayor-office', MayorOfficeController::class)->name('mayor-office');

    Route::get('/memoranda', [MemorandumController::class, 'index'])->name('memoranda.index');
    Route::get('/memoranda/create', [MemorandumController::class, 'create'])->name('memoranda.create');
    Route::post('/memoranda', [MemorandumController::class, 'store'])->name('memoranda.store');
    Route::get('/memoranda/{memorandum}', [MemorandumController::class, 'show'])->name('memoranda.show');
    Route::post('/memoranda/{memorandum}/acknowledge', [MemorandumController::class, 'acknowledge'])->name('memoranda.acknowledge');

    Route::get('/legislation', [LegislativeRecordController::class, 'index'])->name('legislation.index');
    Route::get('/legislation/create', [LegislativeRecordController::class, 'create'])->name('legislation.create');
    Route::post('/legislation', [LegislativeRecordController::class, 'store'])->name('legislation.store');
    Route::get('/legislation/{record}', [LegislativeRecordController::class, 'show'])->name('legislation.show');

    Route::get('/hris', HrisController::class)->name('hris');
    Route::get('/hris/dtr', [DtrController::class, 'index'])->name('hris.dtr');
    Route::get('/hris/payroll', PayrollController::class)->name('hris.payroll');
    Route::post('/hris/leave-requests', [LeaveRequestController::class, 'store'])->name('hris.leave.store');

    Route::get('/hris/health-access', [HealthAccessController::class, 'index'])->name('hris.health.access');
    Route::post('/hris/health-access', [HealthAccessController::class, 'store'])->name('hris.health.access.store');
    Route::post('/hris/health-access/{grant}/revoke', [HealthAccessController::class, 'revoke'])->name('hris.health.access.revoke');
    Route::get('/hris/health/{employee}', [EmployeeHealthVaultController::class, 'show'])->name('hris.health.show');
    Route::post('/hris/health/{employee}', [EmployeeHealthVaultController::class, 'store'])->name('hris.health.store');

    Route::middleware('hris.admin')->prefix('hris/admin')->group(function (): void {
        Route::get('/', [HrisAdminController::class, 'index'])->name('hris.admin');
        Route::post('/leave-requests/{leaveRequest}/approve', [HrisAdminController::class, 'approve'])->name('hris.leave.approve');
        Route::post('/leave-requests/{leaveRequest}/reject', [HrisAdminController::class, 'reject'])->name('hris.leave.reject');

        Route::post('/dtr/generate', [DtrController::class, 'generate'])->name('hris.dtr.generate');
        Route::post('/dtr/{period}/lock', [DtrController::class, 'lock'])->name('hris.dtr.lock');
        Route::post('/payroll/{payroll}/link-dtr', [DtrController::class, 'linkPayroll'])->name('hris.payroll.link-dtr');

        Route::get('/development', [HrisDevelopmentController::class, 'index'])->name('hris.development.index');
        Route::post('/development/employees/{employee}/performance', [HrisDevelopmentController::class, 'storePerformance'])->name('hris.development.performance.store');
        Route::post('/development/employees/{employee}/records', [HrisDevelopmentController::class, 'storeDevelopment'])->name('hris.development.record.store');
        Route::post('/development/sync-expiries', [HrisDevelopmentController::class, 'syncExpiryAlerts'])->name('hris.development.expiry.sync');

        Route::get('/lifecycle', [HrisLifecycleController::class, 'index'])->name('hris.lifecycle.index');
        Route::post('/lifecycle/onboarding', [HrisLifecycleController::class, 'storeOnboarding'])->name('hris.lifecycle.onboarding.store');
        Route::get('/lifecycle/onboarding/{case}', [HrisLifecycleController::class, 'showOnboarding'])->name('hris.lifecycle.onboarding.show');
        Route::post('/lifecycle/onboarding/tasks/{task}/complete', [HrisLifecycleController::class, 'completeOnboardingTask'])->name('hris.lifecycle.onboarding.tasks.complete');
        Route::post('/lifecycle/onboarding/{case}/complete', [HrisLifecycleController::class, 'completeOnboarding'])->name('hris.lifecycle.onboarding.complete');
        Route::post('/lifecycle/employees/{employee}/movements', [HrisLifecycleController::class, 'applyMovement'])->name('hris.lifecycle.movements.store');
        Route::post('/lifecycle/movement-tasks/{task}/complete', [HrisLifecycleController::class, 'completeMovementTask'])->name('hris.lifecycle.movement.tasks.complete');

        Route::get('/offboarding', [HrisOffboardingController::class, 'index'])->name('hris.offboarding.index');
        Route::post('/offboarding', [HrisOffboardingController::class, 'store'])->name('hris.offboarding.store');
        Route::get('/offboarding/{case}', [HrisOffboardingController::class, 'show'])->name('hris.offboarding.show');
        Route::post('/offboarding/tasks/{task}/complete', [HrisOffboardingController::class, 'completeTask'])->name('hris.offboarding.tasks.complete');
        Route::post('/offboarding/{case}/finalize', [HrisOffboardingController::class, 'finalize'])->name('hris.offboarding.finalize');
    });

    Route::get('/audit', AuditController::class)->name('audit');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
