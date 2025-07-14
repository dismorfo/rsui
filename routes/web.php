<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CollectionController;
use App\Services\ExternalApiService;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\PartnersController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ExternalAuthController;

Route::middleware(['auth', 'verified', 'check.external.expiration'])->group(function () {

    // List partners
    Route::get('dashboard', [PartnersController::class, 'index'])
        ->name('dashboard');

    // Show partner by id
    Route::get('partners/{partner}', [PartnersController::class, 'show'])
        ->name('partner.show')
        ->whereUuid('partner');

    // Show collection by id
    Route::get('collections/{collection}', [CollectionController::class, 'show'])
        ->name('collection.show')
        ->whereUuid('collection');

    // Show collection + files from path
    Route::get('/paths/{partner}/{collection}/{path}', [CollectionController::class, 'path'])->where('path', '.*')->name('collections.path');

    // List files from path
    Route::get('/fs/{path}', [ExternalApiService::class, 'getPath'])->where('path', '.*');

    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

});

Route::middleware('guest')->group(function () {

    Route::get('/', [WelcomeController::class, 'index'])
	  ->name('home');

     Route::get('login', [ExternalAuthController::class, 'create'])
        ->name('login');

    Route::post('login', [ExternalAuthController::class, 'login'])
        ->name('login.post');

});


