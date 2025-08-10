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

import { GudangComponent } from "./gudang/gudang.component";
import { GudangFormComponent } from "./gudang/gudang-form.component";
import { MappingJurnalComponent } from "./mapping-jurnal/mapping-jurnal.component";
import { MappingJurnalFormComponent } from "./mapping-jurnal/mapping-jurnal-form.component";
import { SalesQuotationComponent } from "./menu/penjualan/penawaran/sales-quotation.component";
import { SalesQuotationFormComponent } from "./menu/penjualan/penawaran/sales-quotation-form.component";
import { VerifyDialogComponent } from "./menu/penjualan/sales-order/verify-dialog.component";
import { InventorySettingsComponent } from "./menu/inventory/setting/inventory-setting.component";
import { InventoryOpeningComponent } from "./menu/inventory/saldo-awal/inventory-opening.component";
import { InventoryOpeningFormComponent } from "./menu/inventory/saldo-awal/inventory-opening-form.component";
import { InventoryReportComponent } from "./menu/inventory/laporan-persediaan/inventory-report.component";
import { DeliveryOrderComponent } from "./menu/penjualan/pengiriman/delivery-order.component";
import { DODetailDialogComponent } from "./menu/penjualan/pengiriman/do-detail-dialog.component";
import { JurnalUmumComponent } from "./menu/keuangan/jurnal-umum/jurnal-umum.component";
import { JurnalFormDialogComponent } from "./menu/keuangan/jurnal-umum/jurnal-form-dialog.component";
import { JurnalDetailDialogComponent } from "./menu/keuangan/jurnal-umum/jurnal-detail-dialog.component";
import { SalesInvoiceComponent } from "./menu/penjualan/faktur-penjualan/sales-invoice.component";
import { InvoiceDetailDialogComponent } from "./menu/penjualan/faktur-penjualan/invoice-detail-dialog.component";
import { SalesOrderFormDialogComponent } from "./menu/penjualan/sales-order/sales-order-form-dialog.component";
import { BankComponent } from "./master/bank/bank.component";
import { BankFormDialogComponent } from "./master/bank/bank-form-dialog.component";
import { CaraBayarComponent } from "./master/cara-bayar/cara-bayar.component";
import { CaraBayarFormDialogComponent } from "./master/cara-bayar/cara-bayar-form-dialog.component";
import { SalesInvoiceCreateDialogComponent } from "./menu/penjualan/faktur-penjualan/sales-invoice-create-dialog.component";
import { SalesTunaiListComponent } from "./menu/penjualan/sales-tunai/sales-tunai-list.component";
import { SalesTunaiFormDialogComponent } from "./menu/penjualan/sales-tunai/sales-tunai-form-dialog.component";

// import { PajakComponent } from "./master/pajak/pajak.component";
// import { PajakFormComponent } from "./master/pajak/pajak-form.component";

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
    GudangComponent,
    GudangFormComponent,
    // PajakComponent,
    // PajakFormComponent,
    MappingJurnalComponent,
    MappingJurnalFormComponent,
    SalesQuotationComponent,
    SalesQuotationFormComponent,
    SalesQuotationComponent,
    SalesQuotationFormComponent,
    VerifyDialogComponent,
    InventorySettingsComponent,
    InventoryOpeningComponent,
    InventoryOpeningFormComponent,
    InventoryReportComponent,
    DeliveryOrderComponent,
    DODetailDialogComponent,
    JurnalUmumComponent,
    JurnalFormDialogComponent,
    JurnalDetailDialogComponent,
    SalesInvoiceComponent,
    InvoiceDetailDialogComponent,
    SalesOrderFormDialogComponent,
    SalesTunaiListComponent,
    SalesTunaiFormDialogComponent,
    SalesInvoiceCreateDialogComponent,
    BankComponent,
    BankFormDialogComponent,
    CaraBayarComponent,
    CaraBayarFormDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{ provide: LOCALE_ID, useValue: "id" }],
})
export class PagesModule {}
