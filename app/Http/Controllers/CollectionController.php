<?php

namespace App\Http\Controllers;

use App\Services\ExternalApiService;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    protected $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        $this->externalApiService = $externalApiService;
    }

    public function show(string $id): Response
    {
        // Consider adding error handling for the API call
        $collection = $this->externalApiService->getCollectionById($id);

        $storage_path = '';

        // Return a single Resource
        return Inertia::render('collection/Index', [
            'collection' => $collection,
            'storage_path' => $storage_path,
        ]);
    }

    public function path(string $partner, string $collection, string $storage_path): Response
    {
        // Consider adding error handling for the API call
        $collection = $this->externalApiService->getCollectionById($collection);

         // Return a single Resource
        return Inertia::render('collection/Index', [
            'storage_path' => $storage_path,
            'collection' => $collection,
        ]);

    }

}


