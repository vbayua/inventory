<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::upsert([
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ],
            [
                'name' => 'Bimo',
                'email' => 'bimo.gudang@imperialkosmetika.id',
                'password' => bcrypt('Bimo@12345'),
            ],
            [
                'name' => 'Desi',
                'email' => 'desi.gudang@imperialkosmetika.id',
                'password' => bcrypt('Desi@12345'),
            ],
        ], ['email'], ['name', 'password']);
    }
}
