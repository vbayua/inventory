<?php

use App\Models\User;
use Database\Seeders\AuthorizationSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

test('roles are created for admin and operator users', function () {
    $admin = User::factory()->admin()->create();
    $operator = User::factory()->operator()->create();

    expect($admin->roles->pluck('name')->all())->toContain('admin');
    expect($operator->roles->pluck('name')->all())->toContain('operator');
});

test('admin and operator permissions are assigned', function () {
    $admin = User::factory()->admin()->create();
    $operator = User::factory()->operator()->create();

    expect($admin->hasPermission('product.delete'))->toBeTrue();
    expect($admin->hasPermission('purchase_order.forceDelete'))->toBeTrue();

    expect($operator->hasPermission('product.viewAny'))->toBeTrue();
    expect($operator->hasPermission('operation.create'))->toBeTrue();
    expect($operator->hasPermission('product.delete'))->toBeFalse();
    expect($operator->hasPermission('purchase_order.forceDelete'))->toBeFalse();
});

test('admin user can access user admin page', function () {
    $admin = User::factory()->admin()->create();

    actingAs($admin)->get('/admin')->assertStatus(200);
});

test('operator user cannot access user admin page', function () {
    $user = User::factory()->operator()->create();

    actingAs($user)->get('/admin')->assertStatus(403);
});

test('admin user can create user', function () {
    $admin = User::factory()->admin()->create();

    $newUser = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'roles' => ['operator'],
    ];
    actingAs($admin)->post('/admin/users', $newUser)->assertRedirect();

    assertDatabaseHas('users', ['email' => 'test@example.com']);
});

test('non admin user cannot create user', function() {
    $user = User::factory()->operator()->create();
    $newUser = [
        'name' => 'Test User',
        'email' => 'test1@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'roles' => ['operator'],
    ];
    actingAs($user)->post('/admin/users', $newUser)->assertForbidden();

    assertDatabaseMissing('users', ['email' => 'test1@example.com',]);

});

test('User created with invalid data fails validation', function () {
    $admin = User::factory()->admin()->create();

    $invalidUser = [
        'name' => '',
        'email' => 'invalid-email',
        'password' => 'pass',
        'password_confirmation' => 'different_pass',
        'roles' => ['nonexistent_role'],
    ];
    actingAs($admin)->post('/admin/users', $invalidUser)->assertSessionHasErrors([
        'name',
        'email',
        'password',
        'roles.0',
    ]);

    assertDatabaseMissing('users', ['email' => 'invalid-email']);
});

test('Admin can assign roles to users', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $updateData = [
        'name' => $user->name,
        'email' => $user->email,
        'roles' => ['operator'],
    ];
    actingAs($admin)->put("/admin/users/{$user->id}", $updateData)->assertRedirect();

    $user->refresh();
    expect($user->roles->pluck('name')->all())->toContain('operator');
});

test('Non-admin cannot assign roles', function () {
    $user1 = User::factory()->operator()->create();
    $user2 = User::factory()->create();

    $updateData = [
        'name' => $user2->name,
        'email' => $user2->email,
        'roles' => ['admin'],
    ];
    actingAs($user1)->put("/admin/users/{$user2->id}", $updateData)->assertForbidden();

    $user2->refresh();
    expect($user2->roles->pluck('name')->all())->not->toContain('admin');
});

test('Admin can delete user', function() {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    actingAs($admin)->delete("/admin/users/{$user->id}")->assertRedirect();

    assertDatabaseMissing('users', ['id' => $user->id]);
});

test('Non-admin cannot delete user', function() {
    $user1 = User::factory()->operator()->create();
    $user2 = User::factory()->create();

    actingAs($user1)->delete("/admin/users/{$user2->id}")->assertForbidden();

    assertDatabaseHas('users', ['id' => $user2->id]);
});

test('Admin user cannot delete itself', function () {
    $admin = User::factory()->admin()->create();

    actingAs($admin)->delete("/admin/users/{$admin->id}")->assertRedirect()->assertSessionHas('error');

    assertDatabaseHas('users', ['id' => $admin->id]);
});

test('Non admin cannot delete other user', function () {
    $user = User::factory()->create();
    asNonAdmin()->delete("/admin/users/{$user->id}")->assertForbidden();
});
