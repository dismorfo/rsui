<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class FilePreviewController extends Controller
{
    public function show(string $path)
    {
        return Inertia::render('FilePreviewer', [
            'item' => [
                'download_url' => '/download/' . $path,
                'name' => basename($path),
            ]
        ]);
    }
}
