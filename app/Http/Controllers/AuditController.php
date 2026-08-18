<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->isRole('system_admin', 'mayor_approver'), 403);

        return Inertia::render('Audit/Index', [
            'events' => AuditLog::query()
                ->with(['actor' => fn ($query) => $query->with('employee.department')])
                ->latest('created_at')
                ->limit(150)
                ->get(),
        ]);
    }
}
