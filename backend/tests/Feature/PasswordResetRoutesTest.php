<?php

namespace Tests\Feature;

use Tests\TestCase;

class PasswordResetRoutesTest extends TestCase
{
    /** @test */
    public function password_reset_routes_are_accessible_without_authentication()
    {
        // Test user forgot password route
        $response = $this->postJson('/superadmin/usuario/forgot-password', [
            'correo' => 'nonexistent@example.com'
        ]);

        // Asserts that we don't get an authentication error
        $this->assertNotEquals(401, $response->status(), 'User forgot password route is protected (401).');
        $this->assertNotEquals(403, $response->status(), 'User forgot password route is forbidden (403).');

        // Test admin forgot password route
        $response = $this->postJson('/superadmin/admin/forgot-password', [
            'correo' => 'nonexistent@example.com'
        ]);

        // Asserts that we don't get an authentication error
        $this->assertNotEquals(401, $response->status(), 'Admin forgot password route is protected (401).');
        $this->assertNotEquals(403, $response->status(), 'Admin forgot password route is forbidden (403).');
    }
}
