import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: " Dashboard",
    icon: "home-outline",
    link: "/pages/dashboard",
    home: true,
  },
  {
    title: " Master Data",
    icon: "folder-outline",
    children: [
      { title: "Pelanggan", link: "/pages/master/pelanggan" },
      { title: "Supplier", link: "/pages/master/supplier" },
      {
        title: "Produk / Barang & Jasa",
        children: [
          { title: "Daftar Produk", link: "/pages/master/produk" },
          { title: "Kategori Produk", link: "/pages/master/kategori-produk" },
          { title: "Satuan", link: "/pages/master/satuan" },
          { title: "Harga Jual & Beli", link: "/pages/master/pricing" },
        ],
      },
      {
        title: "Akun COA",
        children: [
          {
            title: "Struktur Akun",
            link: "/pages/master/coa",
            icon: "layers-outline",
          },
          { title: "Mapping Jurnal", link: "/pages/master/journal-mapping" },
        ],
      },
      { title: "Karyawan", link: "/pages/master/employee" },
      { title: "Gudang / Lokasi", link: "/pages/master/warehouse" },
      { title: "Departemen / Divisi / Proyek", link: "/pages/master/project" },
      { title: "Cabang", link: "/pages/master/branch" },
      { title: "Mata Uang", link: "/pages/master/currency" },
      { title: "Pajak", link: "/pages/master/tax" },
    ],
  },
  {
    title: " Penjualan",
    icon: "shopping-cart-outline",
    children: [
      { title: "Penawaran", link: "/pages/sales/quotation" },
      { title: "Pesanan", link: "/pages/sales/order" },
      { title: "Pengiriman", link: "/pages/sales/delivery" },
      { title: "Faktur", link: "/pages/sales/invoice" },
      { title: "Pembayaran", link: "/pages/sales/payment" },
      { title: "Retur", link: "/pages/sales/return" },
      { title: "Piutang", link: "/pages/sales/receivable" },
      { title: "Laporan", link: "/pages/sales/report" },
    ],
  },
  {
    title: " Pembelian",
    icon: "car-outline",
    children: [
      { title: "Permintaan Pembelian", link: "/pages/purchase/pr" },
      { title: "Purchase Order", link: "/pages/purchase/po" },
      { title: "Penerimaan Barang", link: "/pages/purchase/receive" },
      { title: "Faktur Pembelian", link: "/pages/purchase/invoice" },
      { title: "Pembayaran", link: "/pages/purchase/payment" },
      { title: "Retur Pembelian", link: "/pages/purchase/return" },
      { title: "Hutang Usaha", link: "/pages/purchase/payable" },
      { title: "Laporan", link: "/pages/purchase/report" },
    ],
  },
  {
    title: "Persediaan",
    icon: "cube-outline",
    children: [
      { title: "Kartu Stok", link: "/pages/inventory/stock-card" },
      { title: "Stok Opname", link: "/pages/inventory/stock-opname" },
      { title: "Mutasi Gudang", link: "/pages/inventory/mutation" },
      { title: "Penyesuaian Stok", link: "/pages/inventory/adjustment" },
      {
        title: "Laporan Persediaan",
        children: [
          { title: "FIFO / Average", link: "/pages/inventory/fifo" },
          { title: "Nilai Persediaan", link: "/pages/inventory/value" },
        ],
      },
    ],
  },
  {
    title: " Produksi",
    icon: "settings-outline",
    children: [
      { title: "Bill of Material", link: "/pages/production/bom" },
      { title: "Work Order", link: "/pages/production/work-order" },
      { title: "Proses Produksi", link: "/pages/production/wip" },
      { title: "Hasil Produksi", link: "/pages/production/output" },
      { title: "Laporan Produksi", link: "/pages/production/report" },
    ],
  },
  {
    title: " Kas & Bank",
    icon: "credit-card-outline",
    children: [
      { title: "Kas Masuk", link: "/pages/cash/in" },
      { title: "Kas Keluar", link: "/pages/cash/out" },
      { title: "Mutasi Kas", link: "/pages/cash/transfer" },
      { title: "Rekonsiliasi Bank", link: "/pages/cash/reconcile" },
      { title: "Laporan Arus Kas", link: "/pages/cash/report" },
    ],
  },
  {
    title: "Akuntansi",
    icon: "book-outline",
    children: [
      { title: "Jurnal Umum", link: "/pages/accounting/journal" },
      { title: "Buku Besar", link: "/pages/accounting/ledger" },
      { title: "Neraca Saldo", link: "/pages/accounting/trial-balance" },
      {
        title: "Laporan Keuangan",
        children: [
          { title: "Neraca", link: "/pages/accounting/balance-sheet" },
          { title: "Laba Rugi", link: "/pages/accounting/income-statement" },
          { title: "Perubahan Modal", link: "/pages/accounting/equity" },
          { title: "Arus Kas", link: "/pages/accounting/cashflow" },
        ],
      },
      { title: "Posting Transaksi", link: "/pages/accounting/posting" },
      { title: "Tutup Buku", link: "/pages/accounting/closing" },
    ],
  },
  {
    title: " SDM & Payroll",
    icon: "people-outline",
    children: [
      { title: "Data Karyawan", link: "/pages/hr/employee" },
      { title: "Jadwal & Absensi", link: "/pages/hr/attendance" },
      { title: "Gaji & Tunjangan", link: "/pages/hr/salary" },
      { title: "Slip Gaji", link: "/pages/hr/payroll-slip" },
      { title: "Pajak PPh 21", link: "/pages/hr/tax" },
      { title: "Laporan Gaji", link: "/pages/hr/report" },
      { title: "BPJS & Potongan", link: "/pages/hr/bpjs" },
    ],
  },
  {
    title: " Aset Tetap",
    icon: "briefcase-outline",
    children: [
      { title: "Registrasi Aset", link: "/pages/asset/register" },
      { title: "Kategori Aset", link: "/pages/asset/category" },
      { title: "Penyusutan Otomatis", link: "/pages/asset/depreciation" },
      { title: "Mutasi & Disposisi", link: "/pages/asset/mutation" },
      { title: "Laporan Aset", link: "/pages/asset/report" },
    ],
  },
  {
    title: " Laporan & Analitik",
    icon: "bar-chart-outline",
    children: [
      { title: "Laporan Transaksi", link: "/pages/report/transaction" },
      { title: "Laporan Persediaan", link: "/pages/report/inventory" },
      { title: "Laporan Keuangan", link: "/pages/report/finance" },
      { title: "Laporan Produksi", link: "/pages/report/production" },
      { title: "Laporan Gaji", link: "/pages/report/salary" },
      { title: "Laporan Proyek", link: "/pages/report/project" },
      { title: "KPI Dashboard", link: "/pages/report/kpi" },
    ],
  },
  {
    title: " AI Assistant",
    icon: "bulb-outline",
    children: [
      { title: "Saran Pembelian", link: "/pages/ai/smart-purchase" },
      { title: "Saran Produksi", link: "/pages/ai/smart-production" },
      { title: "Saran Harga", link: "/pages/ai/smart-pricing" },
      { title: "Forecast Penjualan", link: "/pages/ai/forecast-sales" },
      { title: "Forecast Stok", link: "/pages/ai/forecast-inventory" },
      { title: "Ringkasan Laporan", link: "/pages/ai/report-summary" },
      { title: "Chat AI (ERP Bot)", link: "/pages/ai/chat" },
    ],
  },
  {
    title: " CRM",
    icon: "activity-outline",
    children: [
      { title: "Prospek & Leads", link: "/pages/crm/leads" },
      { title: "Follow-up", link: "/pages/crm/followup" },
      { title: "Aktivitas Sales", link: "/pages/crm/activity" },
      { title: "Target Penjualan", link: "/pages/crm/target" },
    ],
  },
  {
    title: " Integrasi",
    icon: "link-outline",
    children: [
      {
        title: "Marketplace / E-Commerce",
        link: "/pages/integration/marketplace",
      },
      { title: "POS (Point of Sale)", link: "/pages/integration/pos" },
      { title: "API / WhatsApp", link: "/pages/integration/api" },
    ],
  },
  {
    title: "Manajemen Pengguna",
    icon: "lock-outline",
    children: [
      { title: "User", link: "/pages/security/user" },
      { title: "Role & Hak Akses", link: "/pages/security/role" },
      { title: "Audit Trail", link: "/pages/security/audit" },
    ],
  },
  {
    title: " Pengaturan",
    icon: "settings-outline",
    children: [
      { title: "Cabang Aktif", link: "/pages/settings/branch" },
      { title: "Periode Akuntansi", link: "/pages/settings/period" },
      { title: "Template Nomor Transaksi", link: "/pages/settings/numbering" },
      { title: "Notifikasi", link: "/pages/settings/notification" },
      { title: "Backup & Restore", link: "/pages/settings/backup" },
    ],
  },
];
