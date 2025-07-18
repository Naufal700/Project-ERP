// src/app/pages/karyawan/karyawan.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NbDatepickerModule } from "@nebular/theme";

import {
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbDialogModule,
  NbToastrModule,
  NbSpinnerModule,
  NbPaginationModule,
  NbFormFieldModule,
  NbSelectModule,
  NbIconModule,
  NbCheckboxModule,
  NbTooltipModule,
} from "@nebular/theme";

import { KaryawanComponent } from "./karyawan.component";
import { KaryawanFormComponent } from "./karyawan-form.component";

@NgModule({
  declarations: [KaryawanComponent, KaryawanFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Nebular UI modules
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbDialogModule.forChild(),
    NbToastrModule.forRoot(),
    NbSpinnerModule,
    NbPaginationModule,
    NbFormFieldModule,
    NbSelectModule,
    NbIconModule,
    NbCheckboxModule,
    NbTooltipModule,
    NbDatepickerModule,
  ],
  exports: [KaryawanComponent],
})
export class KaryawanModule {}
