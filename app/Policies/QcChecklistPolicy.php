<?php

namespace App\Policies;

use App\Models\QcChecklist;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QcChecklistPolicy
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

    public function view(User $user, QcChecklist $qcChecklist): bool
    {
        return $this->hasPermission($user, 'view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'create');
    }

    public function update(User $user, QcChecklist $qcChecklist): bool
    {
        return $this->hasPermission($user, 'update');
    }

    public function delete(User $user, QcChecklist $qcChecklist): bool
    {
        return $this->hasPermission($user, 'delete');
    }

    public function restore(User $user, QcChecklist $qcChecklist): bool
    {
        return $this->hasPermission($user, 'restore');
    }

    public function forceDelete(User $user, QcChecklist $qcChecklist): bool
    {
        return $this->hasPermission($user, 'forceDelete');
    }
}
