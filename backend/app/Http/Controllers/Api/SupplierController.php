<?php

namespace App\Http\Controllers\Api;

use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Exports\SupplierExport;
use App\Exports\TemplateSupplierExport;
use App\Imports\SupplierImport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class SupplierController extends Controller
{
    public function index()
    {
        return Supplier::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_supplier' => 'required|unique:supplier_m',
            'nama_supplier' => 'required',
        ]);

        return Supplier::create($request->all());
    }

    public function show($id)
    {
        return Supplier::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        // Validasi kode_supplier saat update
        $request->validate([
            'kode_supplier' => 'required|unique:supplier_m,kode_supplier,' . $id,
            'nama_supplier' => 'required',
        ]);

        $supplier->update($request->all());
        return $supplier;
    }

    public function destroy($id)
    {
        Supplier::destroy($id);
        return response()->json(['message' => 'Data supplier berhasil dihapus']);
    }

    // ✅ Export Template Supplier
    public function downloadTemplate()
    {
        return Excel::download(new SupplierExport, 'template_supplier.xlsx');
    }

    // ✅ Import Supplier dari Excel
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        Excel::import(new SupplierImport, $request->file('file'));
        return response()->json(['message' => 'Import supplier berhasil'], 200);
    }
}
