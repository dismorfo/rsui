<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class ExternalAuthController extends Controller
{

    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => false, // Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function login(Request $request)
    {

        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $endpoint = config('services.rs.v1.endpoint');

        $endpoint = $endpoint . 'sessions';

        // Call external API
        $response = Http::post($endpoint, $request->only('email', 'password'));

        if (!$response->ok()) {
            return back()->withErrors(['email' => 'Invalid credentials']);
        }

        $data = $response->json();

        $authCookie = optional(
            collect($response->cookies()->toArray())
                ->firstWhere('Name', 'Authorization')
        )['Value'] ?? null;

        if (!$authCookie) {
            return back()->withErrors(['email' => 'Missing auth cookie from external API']);
        }

        // Store it in the session
        session(['external_auth_cookie' => $authCookie]);

        // Create or update local user (for Sanctum session)
        $user = User::updateOrCreate(
            ['email' => $request->email],
            [
                'name' => $data['username'] ?? 'External User',
                'password' => Hash::make(Str::random(32)),
            ]
        );

        Auth::login($user);

        return redirect()->intended('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

}
