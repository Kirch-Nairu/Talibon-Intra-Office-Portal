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

        foreach (['/dashboard', '/transactions', '/correspondence', '/mayor-office', '/memoranda', '/departments', '/audit'] as $href) {
            $this->assertStringContainsString("href: '{$href}'", $layout);
        }

        foreach (['/operations', '/legislation', '/hris', '/employees', '/reports'] as $href) {
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

        $this->assertTrue(Route::has('correspondence.index'));
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
