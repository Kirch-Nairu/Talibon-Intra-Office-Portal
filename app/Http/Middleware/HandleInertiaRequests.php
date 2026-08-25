<?php

namespace App\Http\Middleware;

use App\Services\AuthenticationAssurance;
use App\Services\NotificationFeedQuery;
use App\Services\Reports\CorePortalReportAccess;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        $applicationAssured = $user
            ? app(AuthenticationAssurance::class)->isSatisfied($request, $user)
            : false;

        if ($applicationAssured) {
            $user->loadMissing('employee.department');
        }

        $feed = null;
        $notificationFeed = function () use (
            &$feed,
            $user,
            $applicationAssured,
        ): array {
            if (! $user || ! $applicationAssured) {
                return NotificationFeedQuery::emptyFeed();
            }

            return $feed ??= app(NotificationFeedQuery::class)->feed($user);
        };

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'employee' => $applicationAssured && $user->employee ? [
                        'employee_number' => $user->employee->employee_number,
                        'position' => $user->employee->position_title,
                        'department' => $user->employee->department ? [
                            'id' => $user->employee->department->id,
                            'code' => $user->employee->department->code,
                            'name' => $user->employee->department->name,
                            'short_name' => $user->employee->department->short_name,
                            'branch' => $user->employee->department->branch,
                            'office_type' => $user->employee->department->office_type,
                            'is_routable' => $user->employee->department->is_routable,
                        ] : null,
                    ] : null,
                ] : null,
            ],
            'permissions' => [
                'reports' => $applicationAssured
                    && app(CorePortalReportAccess::class)->allows($user),
            ],
            'pendingMemo' => fn () => $notificationFeed()['pendingMemo'],
            'unreadMemoCount' => fn () => $notificationFeed()['unreadMemoCount'],
            'unreadPlatformNotificationCount' => fn () => $notificationFeed()['unreadPlatformNotificationCount'],
            'notifications' => fn () => $notificationFeed()['notifications'],
            'notificationCount' => fn () => $notificationFeed()['notificationCount'],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
