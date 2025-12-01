<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // You can create partners here using a factory or manually
        $names = [
            'Mutiara Packaging',
            'Twinpack Indonesia',
            'PT. Sanitas Food',
            'Mutiara Packindo',
            'PT. Tirta Buana Kemindo',
            'Packindo Selaras',
            'PT. Bintang Penuh Berkat',
            'Delta Plast Indonesia',
            'H & D Printing (Bekasi)',
            'JC Packaging',
            'Sari Botol Packaging',
            'Haki Stationery',
            'Andra Artomono Sejahtera',
            'PT. Nala Banyu Glass',
            'Gemilang Sablon',
            'Bapak Dian',
            'Nala Banyu Glass',
            'Putra Sukapura Buana',
            'R Parfume Official',
            'PT. Bintang Penuh Berkah',
            'Percetakan Mury Rizky',
            'CV. Dua Djuli',
            'PT. Duta Grafika Indonesia',
            'Dus Box Cirebon',
            'Pixel Print Surabaya',
            'Citra Plastik',
            'Khalif Azzam'
        ];
        foreach ($names as $name) {
            \App\Models\Partner::firstOrCreate(
                ['name' => $name],
            );
        }
    }
}
