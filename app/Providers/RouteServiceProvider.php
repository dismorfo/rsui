<?php

use Illuminate\Support\Facades\Route;
use Inertia\Middleware;

Route::middleware(['web', \App\Http\Middleware\HandleInertiaRequests::class])
    ->group(function () {
        Route::inertia('/', 'Dashboard')->middleware('auth');
    });

