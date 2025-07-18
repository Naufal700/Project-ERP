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
