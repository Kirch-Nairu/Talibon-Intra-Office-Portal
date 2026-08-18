<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\HrisAdminController;
use App\Http\Controllers\HrisController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LegislativeRecordController;
use App\Http\Controllers\MayorOfficeController;
use App\Http\Controllers\MemorandumController;
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
    Route::post('/hris/leave-requests', [LeaveRequestController::class, 'store'])->name('hris.leave.store');
    Route::middleware('hris.admin')->prefix('hris/admin')->group(function (): void {
        Route::get('/', [HrisAdminController::class, 'index'])->name('hris.admin');
        Route::post('/leave-requests/{leaveRequest}/approve', [HrisAdminController::class, 'approve'])->name('hris.leave.approve');
        Route::post('/leave-requests/{leaveRequest}/reject', [HrisAdminController::class, 'reject'])->name('hris.leave.reject');
    });

    Route::get('/audit', AuditController::class)->name('audit');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
