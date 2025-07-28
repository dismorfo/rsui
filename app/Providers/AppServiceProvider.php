<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Client\Events\ResponseReceived;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {

            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);

            $this->app->register(TelescopeServiceProvider::class);

        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('local')) {
            Event::listen(ResponseReceived::class, function (ResponseReceived $event) {
                Log::info('HTTP Client Response Received:', [
                    'method' => $event->request->method(),
                    'url' => (string) $event->request->url(), // Cast Url object to string
                    'request_headers' => $event->request->headers(),
                    'request_body' => $event->request->body(), // Be careful with sensitive data
                    'status' => $event->response->status(),
                    'response_headers' => $event->response->headers(),
                    'response_body' => $event->response->body(), // Log the response body
                ]);
            });
        }
    }

}
