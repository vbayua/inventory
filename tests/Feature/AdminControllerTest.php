<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\AuthorizationSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(AuthorizationSeeder::class);
});

test('lists users with their roles and the role filter options', function () {
    $operator = User::factory()->operator()->create(['name' => 'Ophelia Operator']);

    $response = asAdmin()->get(route('admin.users.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/User/Index')
        ->where('roleNames', ['admin', 'operator'])
        ->where('users', fn ($users) => collect($users)->contains(fn (array $user) => $user['id'] === $operator->id
            && collect($user['roles'])->pluck('name')->all() === ['operator']))
        ->missing('users.0.password')
    );
});

test('creates a user with every selected role', function () {
    $response = asAdmin()->post(route('admin.users.store'), [
        'name' => 'Dual Role',
        'email' => 'dual@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'roles' => ['admin', 'operator'],
    ]);

    $response->assertRedirectToRoute('admin.users.index');
    $user = User::where('email', 'dual@example.com')->firstOrFail();
    expect($user->roles->pluck('name')->sort()->values()->all())->toBe(['admin', 'operator']);
});

test('requires at least one role when creating a user', function () {
    $response = asAdmin()->post(route('admin.users.store'), [
        'name' => 'No Role',
        'email' => 'norole@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'roles' => [],
    ]);

    $response->assertSessionHasErrors(['roles' => 'The roles field is required.']);
    $this->assertDatabaseMissing('users', ['email' => 'norole@example.com']);
});

test('offers every role, including newly created ones, on the edit form', function () {
    $auditor = Role::factory()->create(['name' => 'auditor']);
    $user = User::factory()->operator()->create();

    $response = asAdmin()->get(route('admin.users.edit', $user));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/User/Edit')
        ->where('roles', fn ($roles) => collect($roles)->pluck('name')->all() === ['admin', 'auditor', 'operator'])
        ->where('user.roles.0.name', 'operator')
    );
});

test('assigns a newly created role when updating a user', function () {
    Role::factory()->create(['name' => 'auditor']);
    $user = User::factory()->operator()->create();

    $response = asAdmin()->put(route('admin.users.update', $user), [
        'name' => $user->name,
        'email' => $user->email,
        'roles' => ['auditor'],
    ]);

    $response->assertRedirectToRoute('admin.users.index');
    expect($user->fresh()->roles->pluck('name')->all())->toBe(['auditor']);
});
