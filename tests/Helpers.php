<?php

use App\Models\User;
use Tests\TestCase;

function asAdmin(): TestCase
{
    $user = User::factory()->admin()->create();

    return test()->actingAs($user);
}

function asNonAdmin(): TestCase
{
    $user = User::factory()->operator()->create();

    return test()->actingAs($user);
}

function asNoRole(): TestCase
{
    $user = User::factory()->create();

    return test()->actingAs($user);
}

function withSession(array $data): TestCase
{
    return test()->withSession($data);
}
