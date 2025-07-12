<?php

namespace App\Services;

use App\Exceptions\ExternalAuthSessionExpiredException;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;

use Exception;

class ExternalApiService
{
    protected $endpoint;

    public function __construct()
    {
        $this->endpoint = config('services.rs.v1.endpoint');
    }

    /**
     * Get files information from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @return array|null The API response data, or null on failure.
     */

    /**
     * Get all resources from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @return array|null The API response data, or null on failure.
     */
    public function getPath(string $path): ?array
    {

        $pathSegments = explode('/', $path);
        $cleanedSegments = [];

        foreach ($pathSegments as $segment) {
            $cleanedSegments[] = preg_replace('/[^a-zA-Z0-9\._-]/', '', $segment);
        }

        $sanitizedPath = implode('/', array_filter($cleanedSegments));

        // After sanitation, you might want to ensure it's not empty
        if (empty($sanitizedPath)) {
            abort(404, 'Invalid file path.');
        }

        $response = $this->makeRequest('GET', $sanitizedPath);

        return $response?->json();
    }

    /**
     * Get all resources from the external API.
     *
     * @param string $endpoint The API endpoint (e.g., 'products', 'users')
     * @return array|null The API response data, or null on failure.
     */
    public function getPartners(): ?array
    {
        $response = $this->makeRequest('GET', 'partners');

        return $response?->json();
    }

    /**
     * Get a single resource by ID from the external API.
     *
     * @param mixed $id The ID of the resource.
     * @return array|null The API response data, or null on failure.
     */
    public function getPartnerById(string $id): ?array
    {

        try {

            $response = $this->makeRequest('GET', "partners/{$id}");

            $data = $response?->json();

            $collection_response = $this->makeRequest('GET', "partners/{$id}/colls");

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
     * @param mixed $id The ID of the resource.
     * @return array|null The API response data, or null on failure.
     */
    public function getCollectionById(string $id): ?array
    {

        try {

            $response = $this->makeRequest('GET', "colls/{$id}");

            $data = $response?->json();

            if (isset($data['storage_url'])) {

                $storage_url = str_replace($this->endpoint, '', $data['storage_url']);

                // https://dev-rsbe.dlib.nyu.edu/api/v0/
                // paths/742e9f1e-9a79-4f54-a7f3-11bc836e5807/7924e049-47a6-42cc-aaaf-50376713f3ed
                $storage = $this->makeRequest('GET', $storage_url);

                $data['storage'] = $storage?->json();

                $__storage['/' . $storage['name']] = [];

                foreach ($data['storage']['children'] as $id => $leaf) {
                  if ($leaf['object_type'] == 'directory') {
                    $leaf_url = str_replace($this->endpoint, '', $leaf['url']);
                    $leaf_storage = $this->makeRequest('GET', $leaf_url);
                    $x = $leaf_storage?->json();
                    $__storage['/' . $storage['name']][] = [
                      'name' => $x['name'],
                      'type' => $x['object_type'],
                      'modified' => $x['last_modified'],
                      'parent_url' => $x['parent_url'],
                    ];
                  }
                }
            }

            if (isset($data['partner_id'])) {

                $partnerId = $data['partner_id'];

                $partner = $this->makeRequest('GET', "partners/{$partnerId}");

                $partnerDataata = $partner?->json();

                $data['partner'] = $partnerDataata;

                $data['storage'] = $__storage;

                return $data;

            } else {
              throw new Exception('partner_id not set');
            }

        } catch (Exception $e) {
            print_r($e);
            Log::error("getCollectionById error: " . $e->getMessage(), [ 'exception' => $e, ]);
            return null;
        }
    }

    /**
     * Get a single resource by ID from the external API.
     *
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

            $this->validateSession();

            $cookie = session('external_auth_cookie');

            $domain = parse_url($this->endpoint, PHP_URL_HOST);

            $response = Http::baseUrl($this->endpoint)
                ->withCookies([
                    'Authorization' => $cookie,
                ], $domain)
                ->send($method, $path, $options);

            if ($response->failed()) {
                Log::error("External API request failed for {$path}: " . $response->body(), [
                    'status' => $response->status(),
                    'response' => $response->json(),
                ]);

                throw new Exception("External API request failed for {$path}");

            }

            $this->updateAuthCookieFromResponse($response);

            return $response;

        } catch (Exception $e) {
            Log::error("External API connection error: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return null;
        }
    }

    /**
     * Update the authentication cookie from the response.
     *
     * @param \Illuminate\Http\Client\Response $response
     * @return void
     */
    private function updateAuthCookieFromResponse(Response $response): void
    {
        $authCookie = optional(
            collect($response->cookies()->toArray())->firstWhere('Name', 'Authorization')
        )['Value'] ?? null;

        if ($authCookie) {
            session(['external_auth_cookie' => $authCookie]);

            $expiresCookie = optional(
                collect($response->cookies()->toArray())->firstWhere('Name', 'Authorization')
            )['Expires'] ?? null;

            session(['external_auth_expires' => $expiresCookie]);
        }
    }

    /**
     * Validate the external authentication session.
     *
     * @return void
     * @throws ExternalAuthSessionExpiredException
     */
    private function validateSession(): void
    {
        $expires = session('external_auth_expires');

        if (!$expires || now()->timestamp > $expires) {
            throw new ExternalAuthSessionExpiredException('External session has expired.');
        }
    }
}
