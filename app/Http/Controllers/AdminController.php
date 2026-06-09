<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Auth\Events\Registered;
use Illuminate\Validation\Rules;


class AdminController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index()
    {
        $users = User::with('roles')->get();
        return Inertia::render('Admin/User/Index', [
            'users' => $users,
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
        $roles = Role::all();
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
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'roles' => $request->roles,
        ]);

        event(new Registered($user));

        return to_route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $user->load('roles');
        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
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
