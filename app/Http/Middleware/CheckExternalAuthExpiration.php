<?php

namespace App\Http\Middleware;

use App\Exceptions\ExternalAuthSessionExpiredException;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckExternalAuthExpiration
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        try {
            // 1. Check if the user is authenticated with Laravel's session
            if (!Auth::check()) {
                // If not authenticated via Laravel, the 'auth' middleware should catch this
                // but it's good to have an explicit check.
                return redirect()->route('login');
            }

            return $next($request);

        } catch (ExternalAuthSessionExpiredException $e) {

            Auth::logout();

            $request->session()->invalidate();

            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error', 'Your external session has expired. Please log in again.');
        }
    }
}
