import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CoaComponent } from "./coa.component";

const routes: Routes = [{ path: "", component: CoaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoaRoutingModule {}
