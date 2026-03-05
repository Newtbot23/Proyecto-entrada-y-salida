<?php

namespace Tests\Feature;

use Tests\TestCase;

class ValidationRulesTest extends TestCase
{
    /** @test */
    public function name_fields_reject_numbers()
    {
        $response = $this->postJson('/api/admins', [
            'doc' => 12345678,
            'nombre' => 'John123',  // Should fail - contains numbers
            'telefono' => '3001234567',
            'correo' => 'test@example.com',
            'contrasena' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nombre']);
    }

    /** @test */
    public function name_fields_accept_spanish_characters()
    {
        $response = $this->postJson('/api/admins', [
            'doc' => 12345679,
            'nombre' => 'José María Ñoño',  // Should pass - valid Spanish name
            'telefono' => '3001234567',
            'correo' => 'jose@example.com',
            'contrasena' => 'password123',
        ]);

        // Should not fail on validation (may fail on other business logic)
        $this->assertNotEquals(422, $response->status());
    }

    /** @test */
    public function phone_fields_reject_letters()
    {
        $response = $this->postJson('/api/admins', [
            'doc' => 12345680,
            'nombre' => 'John Doe',
            'telefono' => '300ABC4567',  // Should fail - contains letters
            'correo' => 'test2@example.com',
            'contrasena' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['telefono']);
    }

    /** @test */
    public function phone_fields_enforce_minimum_length()
    {
        $response = $this->postJson('/api/admins', [
            'doc' => 12345681,
            'nombre' => 'John Doe',
            'telefono' => '12345',  // Should fail - too short (min 7)
            'correo' => 'test3@example.com',
            'contrasena' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['telefono']);
    }

    /** @test */
    public function phone_fields_accept_valid_numbers()
    {
        $response = $this->postJson('/api/admins', [
            'doc' => 12345682,
            'nombre' => 'John Doe',
            'telefono' => '3001234567',  // Should pass - valid phone
            'correo' => 'test4@example.com',
            'contrasena' => 'password123',
        ]);

        // Should not fail on validation
        $this->assertNotEquals(422, $response->status());
    }
}
