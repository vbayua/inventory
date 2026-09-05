<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function __construct()
    {
        //
    }

    public function index(): Response
    {
        $roles = Role::all();

        return Inertia::render('Roles/Index', compact('roles'));
    }

    public function show(Role $role): Response
    {
        $rolePermissions = $role->permissions()->select(['permissions.id', 'permissions.name', 'permissions.description'])->get();

        return Inertia::render('Roles/Show', compact('role', 'rolePermissions'));
    }

    public function edit(Role $role)
    {
        return Inertia::render('Roles/Edit', compact('role'));
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update($request->validated());

        return redirect()->route('role.index')->with('success', 'Role updated successfully');
    }

    public function editPermission(Role $role)
    {
        $permissions = Permission::get(['id', 'name', 'description']);
        $rolePermissions = $role->permissions()->select(['permissions.id', 'permissions.name', 'permissions.description'])->get();

        return Inertia::render('Roles/EditPermission', compact('role', 'permissions', 'rolePermissions'));
    }

    public function updatePermission(Request $request, Role $role)
    {
        $role->permissions()->sync($request->input('permissions', []));

        return redirect()->route('role.edit.permissions', $role)->with('success', 'Permissions updated successfully');
    }
}
