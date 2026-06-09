<?php

namespace App\Policies;

use App\Models\QcInspection;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QcInspectionPolicy
{
    use HandlesAuthorization;

    private function hasPermission(User $user, string $ability): bool
    {
        return $user->hasPermission("qc_inspection.{$ability}");
    }

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'viewAny');
    }

    public function view(User $user, QcInspection $qcInspection): bool
    {
        return $this->hasPermission($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create');
    }

    public function update(User $user, QcInspection $qcInspection): bool
    {
        return $this->hasPermission($user, 'update');
    }

    public function delete(User $user, QcInspection $qcInspection): bool
    {
        return $this->hasPermission($user, 'delete');
    }

    public function restore(User $user, QcInspection $qcInspection): bool
    {
        return $this->hasPermission($user, 'restore');
    }

    public function forceDelete(User $user, QcInspection $qcInspection): bool
    {
        return $this->hasPermission($user, 'forceDelete');
    }

    public function approve(User $user, QcInspection $qcInspection): bool
    {
        return $this->hasPermission($user, 'approve');
    }
}
