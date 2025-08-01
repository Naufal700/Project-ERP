<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CoaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PajakController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\GudangController;
use App\Http\Controllers\Api\ProdukController;
use App\Http\Controllers\Api\ProyekController;
use App\Http\Controllers\API\SatuanController;
use App\Http\Controllers\Api\KaryawanController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PelangganController;
use App\Http\Controllers\Api\MappingJurnalController;
use App\Http\Controllers\API\KategoriProdukController;
use App\Http\Controllers\Api\SalesQuotationController;
use App\Http\Controllers\Api\HargaJualProdukController;
use App\Http\Controllers\Api\SalesOrderController;


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

// Route Pelanggan
Route::get('/pelanggan/export-excel', [PelangganController::class, 'exportExcel']);
Route::get('/pelanggan/template-excel', [PelangganController::class, 'downloadTemplate']);
Route::post('/pelanggan/import-excel', [PelangganController::class, 'importExcel']);
Route::apiResource('pelanggan', PelangganController::class)->where(['pelanggan' => '[0-9]+']);

// Route COA
Route::get('coa/export-excel', [CoaController::class, 'exportExcel']);
Route::post('coa/import-excel', [CoaController::class, 'importExcel']);
Route::get('coa/parents', [CoaController::class, 'listParents']);
Route::get('coa/search', [CoaController::class, 'search']);
Route::patch('coa/{id}/toggle-aktif', [CoaController::class, 'toggleAktif']);

Route::apiResource('coa', CoaController::class);


// Route Supplier
Route::get('/supplier/template-excel', [SupplierController::class, 'downloadTemplate']);
Route::post('/supplier/import-excel', [SupplierController::class, 'importExcel']);
Route::apiResource('supplier', SupplierController::class);

// Route Satuan Produk
Route::apiResource('satuan', SatuanController::class);
// Route Kategori Produk
Route::apiResource('kategori-produk', KategoriProdukController::class);

// Route Produk
Route::get('produk/generate-kode', [ProdukController::class, 'generateKode']);
Route::get('produk/export-excel', [ProdukController::class, 'export']);       // Export produk
Route::post('produk/import-excel', [ProdukController::class, 'import']);      // Import produk
Route::get('produk/template-excel', [ProdukController::class, 'downloadTemplate']); // Template produk
Route::apiResource('produk', ProdukController::class);


Route::apiResource('harga-jual', HargaJualProdukController::class);

Route::prefix('karyawan')->name('karyawan.')->group(function () {
    Route::get('/download-template', [KaryawanController::class, 'downloadTemplate'])->name('downloadTemplate'); // GET download template excel
    Route::post('/import', [KaryawanController::class, 'import'])->name('import');       // POST import excel
    Route::get('/', [KaryawanController::class, 'index'])->name('index');                 // GET semua karyawan
    Route::post('/', [KaryawanController::class, 'store'])->name('store');               // POST tambah karyawan
    Route::put('/{id}', [KaryawanController::class, 'update'])->name('update');          // PUT update karyawan
    Route::delete('/{id}', [KaryawanController::class, 'destroy'])->name('destroy');     // DELETE hapus karyawan
});


Route::prefix('gudang')->group(function () {
    Route::get('/download-template', [GudangController::class, 'downloadTemplate']); // Download template excel
    Route::post('/import', [GudangController::class, 'import']);             // Import excel
    Route::get('/kode-otomatis', [GudangController::class, 'kodeOtomatis']); // Generate kode otomatis
    Route::get('/', [GudangController::class, 'index']);                     // List gudang
    Route::post('/', [GudangController::class, 'store']);                    // Tambah gudang
    Route::get('/{id}', [GudangController::class, 'show']);                  // Detail gudang
    Route::put('/{id}', [GudangController::class, 'update']);                // Update gudang
    Route::delete('/{id}', [GudangController::class, 'destroy']);            // Hapus gudang
});

Route::apiResource('divisi', DivisiController::class);
Route::apiResource('proyek', ProyekController::class);

Route::apiResource('pajak', PajakController::class);

// Route Mapping Jurnal
Route::get('/mapping-jurnal', [MappingJurnalController::class, 'index']);
Route::post('/mapping-jurnal', [MappingJurnalController::class, 'store']);
Route::get('/mapping-jurnal/{id}', [MappingJurnalController::class, 'show']);
Route::put('/mapping-jurnal/{id}', [MappingJurnalController::class, 'update']);
Route::delete('/mapping-jurnal/{id}', [MappingJurnalController::class, 'destroy']);

// Endpoint tambahan untuk dropdown akun COA
Route::get('/mapping-jurnal/coa/list', [MappingJurnalController::class, 'getCOA']);

// Route Penawaran
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('sales/quotation')->group(function () {
        Route::get('/', [SalesQuotationController::class, 'index']);
        Route::post('/', [SalesQuotationController::class, 'store']);
        Route::get('/{id}', [SalesQuotationController::class, 'show']);
        Route::put('/{id}', [SalesQuotationController::class, 'update']);
        Route::delete('/{id}', [SalesQuotationController::class, 'destroy']);
        Route::post('/{id}/approve', [SalesQuotationController::class, 'approve']);
        Route::post('/{id}/reject', [SalesQuotationController::class, 'reject']);
    });
});

// Route Sales Order

Route::middleware('auth:sanctum')->group(function () {
    // Menampilkan SO yang sudah dibuat
    Route::get('sales/order', [SalesOrderController::class, 'index']);
    Route::get('sales/order/{id}', [SalesOrderController::class, 'show']);
    Route::post('sales/order', [SalesOrderController::class, 'store']);
    Route::put('sales/order/{id}', [SalesOrderController::class, 'update']);
    Route::delete('sales/order/{id}', [SalesOrderController::class, 'destroy']);
    Route::post('sales/order/{id}/cancel', [SalesOrderController::class, 'cancel']);

    // APPROVE / REJECT berdasarkan QUOTATION ID
    Route::post('sales/quotation/{id}/approve', [SalesOrderController::class, 'approveQuotation']);
    Route::post('sales/quotation/{id}/reject', [SalesOrderController::class, 'rejectQuotation']);

    // Ambil draft quotation untuk di-approve
    Route::get('sales/quotation/draft', [SalesOrderController::class, 'draftQuotations']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('sales/quotations/draft', [SalesOrderController::class, 'draftQuotations']);
    Route::post('sales/quotations/{id}/approve', [SalesOrderController::class, 'approveQuotation']);
    Route::post('sales/quotations/{id}/reject', [SalesOrderController::class, 'rejectQuotation']);
    Route::get('sales/orders', [SalesOrderController::class, 'listOrders']);
});
