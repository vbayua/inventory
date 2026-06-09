<?php

namespace App\Providers;

use App\Models\Partner;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\QcChecklist;
use App\Models\QcInspection;
use App\Models\ReceiveOrder;
use App\Models\Supplier;
use App\Models\User;
use App\Policies\AdminPolicy;
use App\Policies\PartnerPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\QcChecklistPolicy;
use App\Policies\QcInspectionPolicy;
use App\Policies\ReceiveOrderPolicy;
use App\Policies\SupplierPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => AdminPolicy::class,
        Product::class => ProductPolicy::class,
        Partner::class => PartnerPolicy::class,
        Supplier::class => SupplierPolicy::class,
        QcInspection::class => QcInspectionPolicy::class,
        QcChecklist::class => QcChecklistPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
