<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CoaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\GudangController;
use App\Http\Controllers\Api\ProdukController;
use App\Http\Controllers\Api\ProyekController;
use App\Http\Controllers\API\SatuanController;
use App\Http\Controllers\Api\KaryawanController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PelangganController;
use App\Http\Controllers\API\KategoriProdukController;
use App\Http\Controllers\Api\HargaJualProdukController;


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

Route::apiResource('suppliers', SupplierController::class);

Route::apiResource('satuan', SatuanController::class);

Route::apiResource('kategori-produk', KategoriProdukController::class);

Route::get('/produk/generate-kode', [ProdukController::class, 'generateKode']);
Route::apiResource('produk', ProdukController::class);
Route::post('produk/import', [ProdukController::class, 'import']);
Route::get('produk/template', [ProdukController::class, 'downloadTemplate']);

Route::apiResource('harga-jual', HargaJualProdukController::class);

Route::prefix('karyawan')->group(function () {
    Route::get('/', [KaryawanController::class, 'index']);
    Route::post('/', [KaryawanController::class, 'store']);
    Route::put('/{id}', [KaryawanController::class, 'update']);
    Route::delete('/{id}', [KaryawanController::class, 'destroy']);
    Route::get('/download-template', [KaryawanController::class, 'downloadTemplate']);
    Route::post('/import', [KaryawanController::class, 'import']);
});

Route::prefix('gudang')->group(function () {
    Route::get('kode-otomatis', [GudangController::class, 'kodeOtomatis']);
    Route::get('/', [GudangController::class, 'index']);
    Route::post('/', [GudangController::class, 'store']);
    Route::get('/{id}', [GudangController::class, 'show']);
    Route::put('/{id}', [GudangController::class, 'update']);
    Route::delete('/{id}', [GudangController::class, 'destroy']);
    Route::get('/template', [GudangController::class, 'downloadTemplate']);
    Route::post('/import', [GudangController::class, 'import']);
});

Route::apiResource('divisi', DivisiController::class);
Route::apiResource('proyek', ProyekController::class);
