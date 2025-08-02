import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import {
  NbCardModule,
  NbButtonModule,
  NbSelectModule,
  NbToastrModule,
} from "@nebular/theme";
import { InventorySettingsComponent } from "./inventory-setting.component";

const routes: Routes = [{ path: "", component: InventorySettingsComponent }];

@NgModule({
  declarations: [InventorySettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbButtonModule,
    NbSelectModule,
    NbToastrModule.forRoot(),
  ],
})
export class InventorySettingsModule {}
