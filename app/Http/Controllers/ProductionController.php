<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductionController extends Controller
{
    public function index()
    {
        return Inertia::render('Production/Index');
    }

    public function show()
    {
        return Inertia::render('Production/Show');
    }
    public function create()
    {
        return Inertia::render('Production/Create');
    }
    public function edit()
    {
        return Inertia::render('Production/Edit');
    }
}
