<?php

namespace Tests\Feature;

use Tests\TestCase;

class SystemAdministrationNavigationBoundaryTest extends TestCase
{
    public function test_admin_navigation_contract_does_not_advertise_parked_domains(): void
    {
        $layout = file_get_contents(resource_path('js/layouts/AppLayout.tsx'));

        $this->assertIsString($layout);
        $this->assertStringContainsString("href: '/admin'", $layout);
        $this->assertStringContainsString('pageProps.permissions.navigation', $layout);
        $this->assertStringNotContainsString('includes(user?.role', $layout);

        foreach (['/operations', '/legislation', '/hris', '/employees'] as $href) {
            $this->assertStringNotContainsString("href: '{$href}'", $layout);
        }
    }
}
