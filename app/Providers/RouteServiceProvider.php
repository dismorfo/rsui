<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', \App\Http\Middleware\HandleInertiaRequests::class])
    ->group(function () {
        Route::inertia('/', 'Dashboard')->middleware('auth');
    });
