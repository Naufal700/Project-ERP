<?php

namespace App\Imports;

use App\Models\Pelanggan;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class PelangganImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Pelanggan([
            'kode_pelanggan' => $row['kode_pelanggan'],
            'nama_pelanggan' => $row['nama_pelanggan'],
            'email'         => $row['email'] ?? null,
            'telepon'       => $row['telepon'] ?? null,
            'alamat'        => $row['alamat'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            '*.kode_pelanggan' => ['required', Rule::unique('pelanggan_m', 'kode_pelanggan')],
            '*.nama_pelanggan' => ['required'],
            '*.email' => ['nullable', 'email'],
            '*.telepon' => ['nullable', 'string', 'max:20'],
            '*.alamat' => ['nullable', 'string'],
        ];
    }
}
