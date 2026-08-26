<?php

namespace Tests\Feature;

use Tests\TestCase;

class SystemAdministrationNavigationContractTest extends TestCase
{
    public function test_system_navigation_remains_server_authoritative_and_reports_fail_closed(): void
    {
        $layout = file_get_contents(resource_path('js/layouts/AppLayout.tsx'));

        $this->assertIsString($layout);
        $this->assertStringContainsString('pageProps.permissions.navigation', $layout);
        $this->assertStringContainsString('pageProps.permissions.reports', $layout);
        $this->assertStringContainsString('pageProps.permissions.reports && navigation.reports', $layout);
        $this->assertStringContainsString("href: '/admin'", $layout);
        $this->assertStringNotContainsString('includes(user?.role', $layout);
        $this->assertStringNotContainsString("user?.role ===", $layout);

        foreach (['/operations', '/legislation', '/hris', '/employees'] as $parkedHref) {
            $this->assertStringNotContainsString("href: '{$parkedHref}'", $layout);
        }
    }
}
