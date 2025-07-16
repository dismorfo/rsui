<?php

namespace App\Services;

use App\Exceptions\ExternalAuthSessionExpiredException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

use Exception;

class ExternalApiService
{
    protected $endpoint;

    public function __construct()
    {
        $this->endpoint = config('services.rs.v1.endpoint');
    }


    /**
     * Streams a file from the external API using authentication.
     *
     * @param string $path The API path to the file (relative to base URL).
     * @param array $headers Optional headers to include in the request.
     * @return StreamedResponse The streamed file download response.
     *
     * @throws \Exception If authentication or the request fails.
     */


    /**
     * Downloads a remote file and returns it as a local download response.
     *
     * @param string $path Remote API file path (relative).
     * @return BinaryFileResponse
     *
     * @throws \Exception If the download fails.
     */

    /**
     * Downloads a remote file and returns it as a local download response.
     *
     * @param string $path Remote API file path (relative URL, may include query string).
     * @return BinaryFileResponse
     *
     * @throws Exception If the download fails or authentication is missing.
     */
    public function downloadFile(string $path): BinaryFileResponse
    {
        $this->validateSession();

        $cookie = session('external_auth_cookie');
        if (!$cookie) {
            throw new Exception("External auth cookie not found.");
        }

        $domain = parse_url($this->endpoint, PHP_URL_HOST);

        $remoteResponse = Http::baseUrl($this->endpoint)
            ->withCookies(['Authorization' => $cookie], $domain)
            ->withOptions(['stream' => true])
            ->get("{$path}?download=true");

        if ($remoteResponse->failed()) {
            Log::error("Download failed", ['status' => $remoteResponse->status()]);
            throw new Exception("Remote download failed");
        }

        // Extract filename safely from URL path (ignoring query string)
        $basename = parse_url($path, PHP_URL_PATH);

        $filename = basename($basename) ?: 'file.txt';

        // Ensure the temp directory exists
        Storage::makeDirectory('temp');

        $tempPath = storage_path("app/temp/{$filename}");

        file_put_contents($tempPath, $remoteResponse->body());

        // Return the download response and delete file after sending
        return response()->download($tempPath)->deleteFileAfterSend(true);
    }

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

        $data = $response->json();
        $data['url'] = "/fs/{$sanitizedPath}";
        if (isset($data['children'])) {
          foreach ($data['children'] as $index => $child) {
            if (isset($data['children'][$index]['url'])) {
              $data['children'][$index]['url'] = str_replace($this->endpoint, '/fs/', $data['children'][$index]['url']);
            }
            if (isset($data['children'][$index]['download_url'])) {
              $data['children'][$index]['download_url'] = str_replace($this->endpoint, '/download/', $data['children'][$index]['download_url']);
            }
          }
        }

        return $data;
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

            if (isset($data['partner_id'])) {

                $partnerId = $data['partner_id'];

                $partner = $this->makeRequest('GET', "partners/{$partnerId}");

                $partnerData = $partner?->json();

                if (isset($data['storage_url'])) {
                  $data['storage_url'] = str_replace($this->endpoint, '/fs/', $data['storage_url']);
                }

                $data['partner'] = $partnerData;

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
    protected function makeRequest(string $method, string $path, array $options = [], bool $useCache = true, int $cacheMinutes = 10): ?Response
    {
        try {

            $this->validateSession();

            // Generate a cache key that is unique to the user and the request
            // We'll use the session ID to tie the cache to the user's session.
            // Also include method, path, and a hash of options to ensure unique requests have unique cache keys.
            $sessionId = session()->getId();

            $cacheKey = "external_api:user_{$sessionId}:{$method}:{$path}:" . md5(json_encode($options));

            // if ($useCache && Cache::has($cacheKey)) {
            //     // Return cached response if it exists and caching is enabled
            //     return Cache::get($cacheKey);
            // }

            $cookie = session('external_auth_cookie');

            if (!$cookie) {
                // Throw an exception indicating an authentication issue
                // @TODO: Create a custom exception like AuthenticationException
                throw new Exception("External authentication cookie not found in session.");
            }

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

            if ($useCache) {
                // Cache the response if caching is enabled
                Cache::put($cacheKey, $response, now()->addMinutes($cacheMinutes));
            }

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
