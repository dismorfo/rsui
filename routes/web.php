<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ImagesController;
use App\Http\Controllers\PartnersController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ExternalAuthController;

Route::middleware(['auth', 'verified'])->group(function () {

    // List partners
    Route::get('dashboard', [PartnersController::class, 'index'])
        ->name('dashboard');

    // Show partner by id
    Route::get('partners/{partner}', [PartnersController::class, 'show'])
        ->name('partner.show');

    // Show collection by id
    Route::get('collections/{collection}', [CollectionController::class, 'show'])
        ->name('collection.show');

    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::get('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

});

Route::middleware('guest')->group(function () {

    Route::get('/', [WelcomeController::class, 'index'])
      ->name('home');

    Route::get('login', [ExternalAuthController::class, 'create'])
        ->name('login');

    Route::post('login', [ExternalAuthController::class, 'login'])
        ->name('login');

});

// Images
Route::get('/img/{path}', [ImagesController::class, 'show'])
    ->where('path', '.*')
    ->name('image');
