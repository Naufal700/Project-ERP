import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbIconModule,
  NbSelectModule,
  NbDialogModule,
  NbTableModule,
} from "@nebular/theme";

import { GudangComponent } from "./gudang.component";
import { GudangFormComponent } from "./gudang-form.component";

@NgModule({
  declarations: [GudangComponent, GudangFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule,
    NbSelectModule,
    NbDialogModule.forChild(),
    NbTableModule,
  ],
})
export class GudangModule {}
