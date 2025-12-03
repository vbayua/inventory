<?php

namespace App\Providers;

use App\Models\Partner;
use App\Models\Product;
use App\Models\Supplier;
use App\Policies\PartnerPolicy;
use App\Policies\ProductPolicy;
use App\Policies\SupplierPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Partner::class => PartnerPolicy::class,
        Supplier::class => SupplierPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
