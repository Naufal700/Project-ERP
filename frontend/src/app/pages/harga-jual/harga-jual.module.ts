import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbDialogModule,
  NbIconModule,
  NbSelectModule,
  NbDatepickerModule,
  NbTableModule,
  NbTooltipModule,
  NbFormFieldModule,
} from "@nebular/theme";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { HargaJualComponent } from "./harga-jual.component";
import { HargaJualFormComponent } from "./harga-jual-form.component";

@NgModule({
  declarations: [HargaJualComponent, HargaJualFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbDialogModule.forChild(),
    NbIconModule,
    NbSelectModule,
    NbDatepickerModule,
    NbTableModule,
    NbTooltipModule,
    NbFormFieldModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HargaJualModule {}
