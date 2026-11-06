<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(): Response
    {
        $users = User::query()
            ->with('roles:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'email_verified_at', 'created_at']);

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'roleNames' => Role::query()->orderBy('name')->pluck('name'),
        ]);
    }

    public function show(User $user)
    {
        // Optionally eager-load relations if needed
        $user->load('roles');

        return Inertia::render('Admin/User/Show', [
            'user' => $user,
        ]);
    }

    public function create()
    {
        $roles = Role::query()->orderBy('name')->get(['id', 'name', 'description']);

        return Inertia::render('Admin/User/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'password_confirmation' => 'required',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->roles()->sync(Role::whereIn('name', $request->roles)->pluck('id')->all());

        event(new Registered($user));

        return to_route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $user->load('roles:id,name');

        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'description']),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class.',email,'.$user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $roles = Role::whereIn('name', $request->roles)->get();
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->roles()->sync($roles->pluck('id')->all());
        $user->save();

        return to_route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'You cannot delete your own account.');
        }
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
