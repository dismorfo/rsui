<?php

namespace App\Http\Controllers;

use App\Services\ExternalApiService;
use Inertia\Inertia;
use Inertia\Response;

class PartnersController extends Controller
{

    protected $externalApiService;

    public function __construct(ExternalApiService $externalApiService)
    {
        $this->externalApiService = $externalApiService;
    }

    public function index(): Response
    {

        $partners = $this->externalApiService->getPartners();

        // Convert the plain array of products to a Laravel Collection
        $partnersCollection = collect($partners);

        return Inertia::render('partners/Index', [ 'partners' => $partnersCollection, ]);

    }

    public function show(string $id): Response
    {
        $partner = $this->externalApiService->getPartnerById($id);

        // Return a single Resource
        return Inertia::render('partner/Index', [ 'partner' => $partner, ]);
    }

}
