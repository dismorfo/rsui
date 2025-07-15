<?php

namespace App\Http\Controllers;

use App\Services\ExternalApiService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Exception;

class CollectionController extends Controller
{
    protected $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        $this->externalApiService = $externalApiService;
    }

    public function show(string $id): Response
    {

        try {

          $collection = $this->externalApiService->getCollectionById($id);

          $partnerId = $collection['partner_id'];

          $collectionId = $collection['id'];

          /**
           * Define the base URL path. This is the starting point for all generated URLs.
           */
          $baseUrl = "/fs/paths/{$partnerId}/{$collectionId}";

          /**
           * Initialize an empty array to store the transformed data.
           */
          $transformedArray = [];

          /**
           * Initialize a variable to keep track of the current URL path as we iterate.
           * For the first element, this will be the $baseUrl.
           * For subsequent elements, it will be the URL of the previous element plus the current directory name.
           */
          $currentUrlPath = $baseUrl;

          /**
           * Initialize an empty array to store the transformed data.
           */
          $storage = [ $collection['code'] ];

          /**
           * Loop through each element in the original array to transform it.
           * We use the index to determine if it's the first element, which has a special URL rule.
           */
          foreach ($storage as $index => $name) {
            // Determine the URL for the current item.
            // If it's the first element (index 0), its URL is just the base URL.
            // Otherwise, append the current directory name to the previous item's URL path.
            if ($index === 0) {
              $itemUrl = $baseUrl;
            } else {
              $itemUrl = $currentUrlPath . '/' . $name;
            }

            // Create the associative array for the current item.
            $transformedArray[] = [
              'name' => $name,
              'object_type' => 'directory',
              'display_size' => '', // As per your desired output, this is an empty string.
              'url' => $itemUrl
            ];

            // Update the current URL path for the next iteration.
            // This ensures that subsequent URLs build upon the current one.
            $currentUrlPath = $itemUrl;
          }

          // Return a single Resource
          return Inertia::render('collection/Index', [
            'collection' => $collection,
            'storage_path' => $transformedArray,
          ]);

        } catch (Exception $e) {
            $msg = "External API error: " . $e->getMessage();
        }
    }

    public function path(string $partnerId, string $collectionId, string $storage_path = ''): Response
    {

        $collection = $this->externalApiService->getCollectionById($collectionId);

        /**
         * Define the base URL path. This is the starting point for all generated URLs.
         */
        $baseUrl = "/fs/paths/{$partnerId}/{$collectionId}";

        /**
         * Initialize an empty array to store the transformed data.
         */
        $transformedArray = [];

        /**
         * Initialize a variable to keep track of the current URL path as we iterate.
         * For the first element, this will be the $baseUrl.
         * For subsequent elements, it will be the URL of the previous element plus the current directory name.
         */
        $currentUrlPath = $baseUrl;

        /**
         * Initialize an empty array to store the transformed data.
         */
        $storage = [ $collection['code'] ];

        if (strlen($storage_path) > 0) {
          $storage = array_unique(array_merge($storage, explode('/', $storage_path)));
        }

        /**
         * Loop through each element in the original array to transform it.
         * We use the index to determine if it's the first element, which has a special URL rule.
         */
        foreach ($storage as $index => $name) {
          // Determine the URL for the current item.
          // If it's the first element (index 0), its URL is just the base URL.
          // Otherwise, append the current directory name to the previous item's URL path.
          if ($index === 0) {
            $itemUrl = $baseUrl;
          } else {
            $itemUrl = $currentUrlPath . '/' . $name;
          }

          // Create the associative array for the current item.
          $transformedArray[] = [
            'name' => $name,
            'object_type' => 'directory',
            'display_size' => '', // As per your desired output, this is an empty string.
            'url' => $itemUrl
          ];

          // Update the current URL path for the next iteration.
          // This ensures that subsequent URLs build upon the current one.
          $currentUrlPath = $itemUrl;
        }

        // Return a single Resource
        return Inertia::render('collection/Index', [
            'collection' => $collection,
            'storage_path' => $transformedArray,
        ]);

    }

}


