<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoDoc;
use Illuminate\Http\JsonResponse;

class TipoDocController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $tipos = TipoDoc::all();
        return response()->json($tipos);
    }
}
