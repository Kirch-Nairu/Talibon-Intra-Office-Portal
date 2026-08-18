<?php

namespace App\Http\Middleware;

use App\Models\MemoRecipient;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('employee.department');
        $pendingMemo = null;
        $unreadMemoCount = 0;

        if ($user) {
            $recipientQuery = MemoRecipient::query()
                ->where('user_id', $user->id)
                ->whereHas('memorandum', function ($query): void {
                    $query->where('status', 'published')
                        ->whereNotNull('published_at')
                        ->where(function ($expiry): void {
                            $expiry->whereNull('expires_at')->orWhere('expires_at', '>', now());
                        });
                });

            $unreadMemoCount = (clone $recipientQuery)->whereNull('viewed_at')->count();
            $pendingRecipient = (clone $recipientQuery)
                ->whereNull('viewed_at')
                ->with(['memorandum.issuer:id,name', 'memorandum.issuingDepartment:id,name,short_name'])
                ->oldest('delivered_at')
                ->first();

            if ($pendingRecipient) {
                $pendingMemo = [
                    'id' => $pendingRecipient->memorandum->id,
                    'memo_number' => $pendingRecipient->memorandum->memo_number,
                    'title' => $pendingRecipient->memorandum->title,
                    'issuer' => $pendingRecipient->memorandum->issuer?->name,
                    'department' => $pendingRecipient->memorandum->issuingDepartment?->short_name ?? $pendingRecipient->memorandum->issuingDepartment?->name,
                    'requires_acknowledgement' => $pendingRecipient->memorandum->requires_acknowledgement,
                ];
            }
        }

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'employee' => $user->employee ? [
                        'employee_number' => $user->employee->employee_number,
                        'position' => $user->employee->position_title,
                        'department' => $user->employee->department ? [
                            'id' => $user->employee->department->id,
                            'code' => $user->employee->department->code,
                            'name' => $user->employee->department->name,
                            'short_name' => $user->employee->department->short_name,
                        ] : null,
                    ] : null,
                ] : null,
            ],
            'pendingMemo' => $pendingMemo,
            'unreadMemoCount' => $unreadMemoCount,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
