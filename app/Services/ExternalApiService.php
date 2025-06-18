<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;

use Exception;

// Documentation:
// https://docs.google.com/document/d/1Qfy7DrxQb4OBnngTxTYx1jdoyYlTnBZwKhKldK3u0dQ/edit?tab=t.0#heading=h.r1b4qlmg96t4

class ExternalApiService
{
    protected $baseUrl;
    protected $username;
    protected $password;
    protected $endpoint;
    protected $v0endpoint;
    protected $v0username;
    protected $v0password;

    public function __construct()
    {
        $this->endpoint = config('services.rs.v1.endpoint');
        $this->v0endpoint = config('services.rs.v0.endpoint');
        $this->v0username = config('services.rs.v0.username');
        $this->v0password = config('services.rs.v0.password');
    }

    /**
     * Get all resources from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @param array $query A key-value array of query parameters.
     * @return array|null The API response data, or null on failure.
     */
    public function getAll(string $endpoint, array $query = []): ?array
    {
        $response = $this->makeRequest('GET', $endpoint, [
            'query' => $query,
        ]);

        return $response?->json();
    }

    /**
     * Get a single resource by ID from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @param mixed $id The ID of the resource.
     * @return array|null The API response data, or null on failure.
     */
    public function getPartnerId(string $id): ?array
    {

        try {

            $path = "partners/{$id}";

            $response = Http::baseUrl($this->v0endpoint)
                            ->withBasicAuth($this->v0username, $this->v0password)
                            ->send('GET', $path, []);

            // You might want more sophisticated error handling here
            if ($response->failed()) {
                // Log the error, throw an exception, or return a specific error structure
                Log::error("External API request failed for {$path}: " . $response->body(), [
                    'status' => $response->status(),
                    'response' => $response->json(),
                ]);
                return null;
            }

            $data = $response?->json();

            $collection_path = "partners/{$id}/colls";

            $collection_response = Http::baseUrl($this->v0endpoint)
                            ->withBasicAuth($this->v0username, $this->v0password)
                            ->send('GET', $collection_path, []);

            // You might want more sophisticated error handling here
            if ($collection_response->failed()) {
                // Log the error, throw an exception, or return a specific error structure
                Log::error("External API request failed for {$path}: " . $collection_response->body(), [
                    'status' => $collection_response->status(),
                    'response' => $collection_response->json(),
                ]);
                return null;
            }

            $collection_data = $collection_response?->json();

            $data['collections'] = $collection_data;

            return $data;

        } catch (Exception $e) {
            Log::error("External API connection error: " . $e->getMessage(), [ 'exception' => $e, ]);
            return null;
        }
    }

    /**
     * Get a single resource by ID from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @param mixed $id The ID of the resource.
     * @return array|null The API response data, or null on failure.
     */
    public function getCollectionById(string $id): ?array
    {

       $response = $this->makeRequest('GET', "colls/{$id}");

       $data = $response?->json();

       $partnerId = $data['partner_id'];

       $partner = $this->makeRequest('GET', "partners/{$partnerId}");

       $partnerDataata = $partner?->json();

       $data['partner'] = $partnerDataata;

       return $data;
    }

    /**
     * Get a single resource by ID from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @param mixed $id The ID of the resource.
     * @return array|null The API response data, or null on failure.
     */
    public function getCollectionsByPartnerId(string $id): ?array
    {

       $response = $this->makeRequest('GET', "partners/{$id}/colls");

       $data = $response?->json();

       return $data;
    }

    /**
     * Make an authenticated HTTP request to the external API.
     *
     * @param string $method The HTTP method (GET, POST, PUT, DELETE).
     * @param string $path The API path relative to the base URL.
     * @param array $options Additional Guzzle request options.
     * @return \Illuminate\Http\Client\Response|null The Laravel HTTP client response, or null on error.
     */
    protected function makeRequest(string $method, string $path, array $options = []): ?Response
    {
        try {

            // futher calls
            $cookie = session('external_auth_cookie');

            Log::debug('Sending request', []);

            $domain = parse_url($this->endpoint, PHP_URL_HOST);

            $response = Http::baseUrl($this->endpoint)
                ->withCookies([
                    'Authorization' => $cookie, // or actual cookie name
                ], $domain)
                ->send($method, $path, $options);

            // $body = $response->body();

            // Log::debug('Response', [
            //     'method' => $method,
            //     'url' => $this->endpoint . $path,
            //     'options' => $options,
            //     'cookie' => $cookie,
            //     'status' => $response->status(),
            //     'headers' => $response->headers(),
            // ]);

            // You might want more sophisticated error handling here
            if ($response->failed()) {
                // Log the error, throw an exception, or return a specific error structure
                Log::error("External API request failed for {$path}: " . $response->body(), [
                    'status' => $response->status(),
                    'response' => $response->json(),
                ]);
                return null;
            }

            return $response;

        } catch (Exception $e) {
            Log::error("External API connection error: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return null;
        }
    }
}
