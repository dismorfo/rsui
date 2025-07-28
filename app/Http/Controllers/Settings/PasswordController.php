<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\ExternalApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PasswordController extends Controller
{
    protected $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        $this->externalApiService = $externalApiService;
    }

    public function edit()
    {
        return Inertia::render('settings/password');
    }

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed',
            'password_confirmation' => 'required',
        ]);

        try {
            $response = $this->externalApiService->updateUserPassword($validatedData);

            if ($response) {
                return back()->with('success', 'Password updated successfully.');
            } else {
                return back()->withErrors(['current_password' => 'The provided password does not match your current password.']);
            }
        } catch (\Exception $e) {
            Log::error('Error updating password: ' . $e->getMessage());
            return back()->with('error', 'An error occurred while updating your password.');
        }
    }
}
