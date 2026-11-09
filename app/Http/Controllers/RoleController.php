<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Role::class, 'role');
    }

    public function index(): Response
    {
        $roles = Role::query()
            ->withCount(['users', 'permissions'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Roles/Index', compact('roles'));
    }

    public function create(): Response
    {
        return Inertia::render('Roles/Create');
    }

    /**
     * Store a new role, then send the user to assign its permissions.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create($request->validated());

        return redirect()->route('role.edit.permissions', $role)->with('success', 'Role created successfully. Assign its permissions below.');
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
        $this->authorize('update', $role);

        $permissions = Permission::get(['id', 'name', 'description']);
        $rolePermissions = $role->permissions()->select(['permissions.id', 'permissions.name', 'permissions.description'])->get();

        return Inertia::render('Roles/EditPermission', compact('role', 'permissions', 'rolePermissions'));
    }

    public function updatePermission(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $role->permissions()->sync($request->input('permissions', []));

        return redirect()->route('role.edit.permissions', $role)->with('success', 'Permissions updated successfully');
    }
}
