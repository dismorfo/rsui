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

        $partner = [];

        // Return a single Resource
        return Inertia::render('collection/Index', [
            'partner' => $partner,
            'collection' => $collection,
        ]);
    }
}
