import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";

import {
  NbMenuModule,
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbSelectModule,
  NbDialogModule,
  NbDatepickerModule,
} from "@nebular/theme";

import { ThemeModule } from "../@theme/theme.module";
import { PagesComponent } from "./pages.component";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ECommerceModule } from "./e-commerce/e-commerce.module";
import { PagesRoutingModule } from "./pages-routing.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";

// Komponen Master
import { PelangganComponent } from "./master/pelanggan/pelanggan.component";
import { PelangganFormDialogComponent } from "./master/pelanggan/pelanggan-form-dialog.component";

import { CoaComponent } from "./master/coa/coa.component";
import { CoaFormDialogComponent } from "./master/coa/coa-form-dialog.component";

import { SupplierComponent } from "./master/supplier/supplier.component";
import { SupplierFormComponent } from "./master/supplier/supplier-form.component";

import { SatuanComponent } from "./master/satuan/satuan.component";
import { SatuanFormComponent } from "./master/satuan/satuan-form.component";

import { KategoriProdukComponent } from "./master/kategori-produk/kategori-produk.component";
import { KategoriProdukFormComponent } from "./master/kategori-produk/kategori-produk-form.component";

import { ProdukComponent } from "./master/produk/produk.component";
import { ProdukFormComponent } from "./master/produk/produk-form..component";

import { KaryawanComponent } from "./karyawan/karyawan.component";
import { KaryawanFormComponent } from "./karyawan/karyawan-form.component";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbSelectModule,
    NbDatepickerModule,
    NbDialogModule.forChild(),
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    NgxPaginationModule,
  ],
  declarations: [
    PagesComponent,
    PelangganComponent,
    PelangganFormDialogComponent,
    CoaComponent,
    CoaFormDialogComponent,
    SupplierComponent,
    SupplierFormComponent,
    SatuanComponent,
    SatuanFormComponent,
    KategoriProdukComponent,
    KategoriProdukFormComponent,
    ProdukComponent,
    ProdukFormComponent,
    KaryawanComponent,
    KaryawanFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{ provide: LOCALE_ID, useValue: "id" }],
})
export class PagesModule {}
