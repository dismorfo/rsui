<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {

       $images = [
            [
                'alt' => '',
                'title' => 'Palante, May 8, 1970',
                'src' => 'https://image1.dlib.nyu.edu:8183/iiif/2/books%2Ftamwag_palante000001%2Ftamwag_palante000001_n000001_d.jp2/full/440,/0/default.jpg',
            ],
            [
                'alt' => '',
                'title' => 'Palante, May 22, 1970',
                'src' => 'https://image1.dlib.nyu.edu:8183/iiif/2/books%2Ftamwag_palante000002%2Ftamwag_palante000002_n000001_d.jp2/full/440,/0/default.jpg',
            ],
            [
                'alt' => '',
                'title' => 'Palante, June 5, 1970',
                'src' => 'https://image1.dlib.nyu.edu:8183/iiif/2/books%2Ftamwag_palante000003%2Ftamwag_palante000003_n000001_d.jp2/full/440,/0/default.jpg',
            ],
            [
                'alt' => '',
                'title' => 'Palante, July 3, 1970',
                'src' => 'https://image1.dlib.nyu.edu:8183/iiif/2/books%2Ftamwag_palante000004%2Ftamwag_palante000004_n000001_d.jp2/full/440,/0/default.jpg',
            ],
            [
                'alt' => '',
                'title' => 'Palante, July 17, 1970',
                'src' => 'https://image1.dlib.nyu.edu:8183/iiif/2/books%2Ftamwag_palante000005%2Ftamwag_palante000005_n000001_d.jp2/full/440,/0/default.jpg',
            ],
            [
                'alt' => '',
                'title' => 'Palante, September 25, 1970',
                'src' => 'https://image1.dlib.nyu.edu:8183/iiif/2/books%2Ftamwag_palante000011%2Ftamwag_palante000011_n000001_d.jp2/full/440,/0/default.jpg',
            ],
        ];

        $key = array_rand($images);

        return Inertia::render('welcome', [ 'image' => $images[$key], ]);

    }
}
