<?php

namespace App\Exports;

use App\Models\JurnalUmum;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class JurnalExport implements FromCollection, WithHeadings
{
    protected $isTemplate;
    protected $filters;

    public function __construct($isTemplate = false, $filters = [])
    {
        $this->isTemplate = $isTemplate;
        $this->filters = $filters;
    }

    public function collection()
    {
        if ($this->isTemplate) {
            // Template kosong, hanya header saja
            return collect([]);
        }

        // Query data jurnal dengan filter sederhana, bisa kamu sesuaikan
        $query = JurnalUmum::query();

        if (!empty($this->filters['from_date'])) {
            $query->where('tanggal', '>=', $this->filters['from_date']);
        }

        if (!empty($this->filters['to_date'])) {
            $query->where('tanggal', '<=', $this->filters['to_date']);
        }

        return $query->select(
            'tanggal',
            'kode_akun',
            'jenis',
            'nominal',
            'keterangan',
            'reference'
        )->get();
    }

    public function headings(): array
    {
        return [
            'Tanggal (YYYY-MM-DD)',
            'Kode Akun',
            'Jenis (debit/kredit)',
            'Nominal',
            'Keterangan',
            'Reference',
        ];
    }
}
