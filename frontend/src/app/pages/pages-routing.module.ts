import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { PagesComponent } from "./pages.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ECommerceComponent } from "./e-commerce/e-commerce.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";
import { PelangganComponent } from "./master/pelanggan/pelanggan.component";
import { CoaComponent } from "./master/coa/coa.component";
import { SupplierComponent } from "./master/supplier/supplier.component";
import { SatuanComponent } from "./master/satuan/satuan.component";
import { KategoriProdukComponent } from "./master/kategori-produk/kategori-produk.component";
import { ProdukComponent } from "./master/produk/produk.component";
import { HargaJualComponent } from "./harga-jual/harga-jual.component";
import { KaryawanComponent } from "./karyawan/karyawan.component";
import { GudangComponent } from "./gudang/gudang.component";
// import { PajakComponent } from "./master/pajak/pajak.component";
import { MappingJurnalComponent } from "./mapping-jurnal/mapping-jurnal.component";
import { SalesQuotationComponent } from "./menu/penjualan/penawaran/sales-quotation.component";
import { SalesOrderComponent } from "./menu/penjualan/sales-order/sales-order.component";
import { DeliveryOrderComponent } from "./menu/penjualan/pengiriman/delivery-order.component";
import { SalesInvoiceComponent } from "./menu/penjualan/faktur-penjualan/sales-invoice.component";
import { InventorySettingsComponent } from "./menu/inventory/setting/inventory-setting.component";
import { InventoryOpeningComponent } from "./menu/inventory/saldo-awal/inventory-opening.component";
import { InventoryReportComponent } from "./menu/inventory/laporan-persediaan/inventory-report.component";
import { JurnalUmumComponent } from "./menu/keuangan/jurnal-umum/jurnal-umum.component";
import { BankComponent } from "./master/bank/bank.component";
import { CaraBayarComponent } from "./master/cara-bayar/cara-bayar.component";
import { SalesTunaiListComponent } from "./menu/penjualan/sales-tunai/sales-tunai-list.component";
import { PiutangComponent } from "./menu/piutang/daftar-piutang/piutang.component";

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "dashboard",
        component: ECommerceComponent,
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "master/pelanggan",
        children: [
          {
            path: "",
            component: PelangganComponent,
          },
        ],
      },
      {
        path: "master/coa",
        children: [
          {
            path: "",
            component: CoaComponent, // Daftar Coa
          },
        ],
      },
      {
        path: "master/supplier",
        children: [
          {
            path: "",
            component: SupplierComponent, // Daftar Supplier
          },
        ],
      },
      {
        path: "master/satuan",
        children: [
          {
            path: "",
            component: SatuanComponent, // Daftar Satuan Produk
          },
        ],
      },
      {
        path: "master/kategori-produk",
        children: [
          {
            path: "",
            component: KategoriProdukComponent, // Daftar Kategori Produk
          },
        ],
      },
      {
        path: "master/produk",
        children: [
          {
            path: "",
            component: ProdukComponent, // Daftar Produk
          },
        ],
      },
      {
        path: "master/harga-jual",
        children: [
          {
            path: "",
            component: HargaJualComponent, // Daftar Harga Produk
          },
        ],
      },
      {
        path: "master/karyawan",
        children: [
          {
            path: "",
            component: KaryawanComponent, // Daftar Karyawan
          },
        ],
      },
      {
        path: "master/gudang",
        children: [
          {
            path: "",
            component: GudangComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "master/bank",
        children: [
          {
            path: "",
            component: BankComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "master/cara-bayar",
        children: [
          {
            path: "",
            component: CaraBayarComponent, // Daftar Gudang
          },
        ],
      },
      // {
      //   path: "master/pajak",
      //   children: [
      //     {
      //       path: "",
      //       component: PajakComponent, // Daftar Pajak
      //     },
      //   ],
      // },
      {
        path: "master/mapping-jurnal",
        children: [
          {
            path: "",
            component: MappingJurnalComponent, // Daftar Gudang
          },
        ],
      },

      // Modul Penjualan
      {
        path: "menu/penjualan/penawaran",
        children: [
          {
            path: "",
            component: SalesQuotationComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/penjualan/sales-order",
        children: [
          {
            path: "",
            component: SalesOrderComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/penjualan/pengiriman",
        children: [
          {
            path: "",
            component: DeliveryOrderComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/penjualan/faktur-penjualan",
        children: [
          {
            path: "",
            component: SalesInvoiceComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/penjualan/sales-tunai",
        children: [
          {
            path: "",
            component: SalesTunaiListComponent, // Daftar Gudang
          },
        ],
      },
      // Modul Piutang
      {
        path: "menu/piutang/daftar-piutang",
        children: [
          {
            path: "",
            component: PiutangComponent, // Daftar Gudang
          },
        ],
      },
      // Modul Persediaan
      {
        path: "menu/inventory/setting",
        children: [
          {
            path: "",
            component: InventorySettingsComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/inventory/saldo-awal",
        children: [
          {
            path: "",
            component: InventoryOpeningComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/inventory/laporan-persediaan",
        children: [
          {
            path: "",
            component: InventoryReportComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "menu/keuangan/jurnal-umum",
        children: [
          {
            path: "",
            component: JurnalUmumComponent, // Daftar Gudang
          },
        ],
      },
      {
        path: "layout",
        loadChildren: () =>
          import("./layout/layout.module").then((m) => m.LayoutModule),
      },
      {
        path: "forms",
        loadChildren: () =>
          import("./forms/forms.module").then((m) => m.FormsModule),
      },
      {
        path: "ui-features",
        loadChildren: () =>
          import("./ui-features/ui-features.module").then(
            (m) => m.UiFeaturesModule
          ),
      },
      {
        path: "modal-overlays",
        loadChildren: () =>
          import("./modal-overlays/modal-overlays.module").then(
            (m) => m.ModalOverlaysModule
          ),
      },
      {
        path: "extra-components",
        loadChildren: () =>
          import("./extra-components/extra-components.module").then(
            (m) => m.ExtraComponentsModule
          ),
      },
      {
        path: "maps",
        loadChildren: () =>
          import("./maps/maps.module").then((m) => m.MapsModule),
      },
      {
        path: "charts",
        loadChildren: () =>
          import("./charts/charts.module").then((m) => m.ChartsModule),
      },
      {
        path: "editors",
        loadChildren: () =>
          import("./editors/editors.module").then((m) => m.EditorsModule),
      },
      {
        path: "tables",
        loadChildren: () =>
          import("./tables/tables.module").then((m) => m.TablesModule),
      },
      {
        path: "miscellaneous",
        loadChildren: () =>
          import("./miscellaneous/miscellaneous.module").then(
            (m) => m.MiscellaneousModule
          ),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "**",
        component: NotFoundComponent,
      },
    ],
  },
  {
    path: "harga-jual",
    loadChildren: () =>
      import("./harga-jual/harga-jual.module").then((m) => m.HargaJualModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
