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
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;

class ExternalAuthController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => false,
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

        $endpoint = config('services.rs.v1.endpoint') . 'sessions';

        try {
            // Call external API
            $response = Http::timeout(10)->post($endpoint, $request->only('email', 'password'));

            if (!$response->successful()) {
                return back()->withErrors(['email' => 'Invalid credentials']);
            }

            $data = $response->json();

            // Extract Authorization cookie from response cookies
            $authCookie = optional(
                collect($response->cookies()->toArray())->firstWhere('Name', 'Authorization')
            )['Value'] ?? null;

            $expiresCookie = optional(
                collect($response->cookies()->toArray())->firstWhere('Name', 'Authorization')
            )['Expires'] ?? null;

            if (!$authCookie) {
                Log::error('Missing Authorization cookie in API response.', ['response' => $response->body()]);
                return back()->withErrors(['email' => 'Missing auth cookie from external API']);
            }

            // Store in session
            session(['external_auth_cookie' => $authCookie]);
            session(['external_auth_expires' => $expiresCookie]);

            // Create or update local user for Sanctum session
            $user = User::updateOrCreate(
                ['email' => $request->email],
                [
                    'name' => $data['username'] ?? 'External User',
                    'password' => Hash::make(Str::random(32)),
                ]
            );

            Auth::login($user);

            return redirect()->intended('/dashboard');

        } catch (ConnectionException $e) {
            return back()->withErrors(['errors' => 'API Connection Error: ' . $e->getMessage()]);
        } catch (RequestException $e) {
            Log::error('API Request Error: ' . $e->getMessage(), ['response' => $e->response ? $e->response->body() : 'No response body']);
            return back()->withErrors(['errors' => 'An error occurred while fetching data from the API.']);
        } catch (\Exception $e) {
            Log::error('Unexpected error: ' . $e->getMessage());
            return back()->withErrors(['errors' => 'An unexpected error occurred.']);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
