<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NormalizeDateFields
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            // Cek field yang mengandung kata 'date'
            if (is_string($value) && stripos($key, 'date') !== false) {
                try {
                    $data[$key] = Carbon::parse($value)->format('Y-m-d');
                } catch (\Exception $e) {
                    // Abaikan jika gagal parse
                }
            }
        }

        $request->merge($data);

        return $next($request);
    }
}
