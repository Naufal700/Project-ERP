<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CoaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PelangganController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::apiResource('pelanggan', PelangganController::class);
Route::get('/pelanggan/template-excel', [PelangganController::class, 'downloadTemplate']);
Route::post('/pelanggan/import-excel', [PelangganController::class, 'importExcel']);

Route::apiResource('coa', CoaController::class);
Route::get('coa/parents', [App\Http\Controllers\Api\CoaController::class, 'listParents']);
Route::get('coa/search', [App\Http\Controllers\Api\CoaController::class, 'search']);
Route::patch('coa/{id}/toggle-aktif', [App\Http\Controllers\Api\CoaController::class, 'toggleAktif']);
