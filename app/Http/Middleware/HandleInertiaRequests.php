<?php

namespace App\Http\Middleware;

use App\Models\MemoRecipient;
use App\Models\TransactionEvent;
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
        $notifications = [];

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
                ->latest('delivered_at')
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

            $memoNotifications = (clone $recipientQuery)
                ->whereNull('viewed_at')
                ->with('memorandum:id,memo_number,title,requires_acknowledgement')
                ->latest('delivered_at')
                ->limit(4)
                ->get()
                ->map(fn (MemoRecipient $recipient): array => [
                    'key' => 'memo-'.$recipient->id,
                    'type' => 'memorandum',
                    'title' => 'New memorandum',
                    'message' => $recipient->memorandum->memo_number.' · '.$recipient->memorandum->title,
                    'url' => '/memoranda/'.$recipient->memorandum->id,
                    'created_at' => $recipient->delivered_at?->toIso8601String(),
                    'urgent' => (bool) $recipient->memorandum->requires_acknowledgement,
                ])
                ->all();

            $workflowNotifications = [];
            $departmentId = $user->employee?->department_id;

            if ($departmentId) {
                $workflowNotifications = TransactionEvent::query()
                    ->with([
                        'transaction:id,reference_no,title,priority,status,current_department_id',
                        'fromDepartment:id,name,short_name',
                    ])
                    ->where('to_department_id', $departmentId)
                    ->whereColumn('from_department_id', '<>', 'to_department_id')
                    ->whereIn('action', ['submitted', 'forward', 'send_to_mayor', 'return_origin', 'request_information'])
                    ->where('created_at', '>=', now()->subDay())
                    ->whereHas('transaction', function ($query) use ($departmentId): void {
                        $query->where('current_department_id', $departmentId)
                            ->whereNotIn('status', ['approved', 'disapproved', 'closed']);
                    })
                    ->latest('created_at')
                    ->limit(5)
                    ->get()
                    ->map(function (TransactionEvent $event) use ($user): array {
                        $transaction = $event->transaction;
                        $origin = $event->fromDepartment?->short_name ?? $event->fromDepartment?->name ?? 'another office';

                        return [
                            'key' => 'tx-event-'.$event->id,
                            'type' => 'transaction',
                            'title' => $user->employee?->department?->code === 'MAYOR'
                                ? 'New executive request received'
                                : 'New transaction received',
                            'message' => $transaction->reference_no.' · '.$transaction->title.' · from '.$origin,
                            'url' => '/transactions/'.$transaction->id,
                            'created_at' => $event->created_at?->toIso8601String(),
                            'urgent' => in_array($transaction->priority, ['high', 'urgent'], true),
                        ];
                    })
                    ->all();
            }

            $notifications = collect([...$memoNotifications, ...$workflowNotifications])
                ->sortByDesc('created_at')
                ->take(8)
                ->values()
                ->all();
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
            'notifications' => $notifications,
            'notificationCount' => count($notifications),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
