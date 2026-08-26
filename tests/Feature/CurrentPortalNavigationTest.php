<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CurrentPortalNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_prototype_navigation_keeps_current_scope_links_and_hides_parked_modules(): void
    {
        $layout = file_get_contents(resource_path('js/layouts/AppLayout.tsx'));
        $this->assertIsString($layout);

        foreach (['/admin', '/dashboard', '/transactions', '/correspondence', '/records', '/mayor-office', '/memoranda', '/departments', '/audit'] as $href) {
            $this->assertStringContainsString("href: '{$href}'", $layout);
        }

        $this->assertStringContainsString("href: '/reports'", $layout);
        $this->assertStringContainsString('pageProps.permissions.navigation', $layout);
        $this->assertStringNotContainsString("['system_admin', 'mayor_approver', 'mayor_staff']", $layout);
        $this->assertStringNotContainsString("['system_admin', 'mayor_approver']", $layout);

        foreach (['/operations', '/legislation', '/hris', '/employees'] as $href) {
            $this->assertStringNotContainsString("href: '{$href}'", $layout);
        }
    }

    public function test_parked_routes_remain_registered_even_when_not_advertised(): void
    {
        foreach ([
            'operations.index',
            'legislation.index',
            'legislative.workspace',
            'hris',
            'hris.dtr',
            'hris.payroll',
            'property.index',
            'property.lifecycle.index',
            'reports.index',
            'employees.index',
        ] as $routeName) {
            $this->assertTrue(Route::has($routeName), "Expected parked route {$routeName} to remain registered.");
        }

        $this->assertTrue(Route::has('admin.index'));
        $this->assertTrue(Route::has('correspondence.index'));
        $this->assertTrue(Route::has('records.index'));
    }

    public function test_public_routes_are_separate_while_internal_routes_keep_security_middleware(): void
    {
        $this->assertTrue(Route::has('public.home'));
        $this->assertTrue(Route::has('public.activate-account'));

        foreach (['admin.index', 'dashboard', 'transactions.index', 'correspondence.index', 'records.index', 'reports.index'] as $routeName) {
            $route = Route::getRoutes()->getByName($routeName);
            $this->assertNotNull($route);
            $middleware = $route->gatherMiddleware();
            $this->assertContains('auth', $middleware, "{$routeName} must remain authenticated.");
            $this->assertContains('active', $middleware, "{$routeName} must preserve active-account enforcement.");
            $this->assertContains('mfa.assured', $middleware, "{$routeName} must preserve MFA assurance.");
        }
    }

    public function test_dashboard_response_does_not_serialize_parked_module_rollups(): void
    {
        $this->seed();
        $mayor = User::query()->where('email', 'mayor@talibon.demo')->firstOrFail();

        $this->actingAs($mayor)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->missing('centralRecords')
                ->missing('operationsSnapshot')
                ->missing('workspace.canAccessHris')
                ->missing('workspace.canManageLegislation'));
    }
}
