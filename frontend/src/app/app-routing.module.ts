import { ExtraOptions, RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "./auth/auth.guard";
import { CustomLoginComponent } from "./auth/custom-login/custom-login.component";
import { CustomRegisterComponent } from "./auth/custom-register/custom-register.component";
import { PelangganComponent } from "./pages/master/pelanggan/pelanggan.component";
import { PelangganFormDialogComponent } from "./pages/master/pelanggan/pelanggan-form-dialog.component";
import { CoaComponent } from "./pages/master/coa/coa.component";

export const routes: Routes = [
  {
    path: "pages",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/pages.module").then((m) => m.PagesModule),
  },
  { path: "pelanggan", component: PelangganComponent },
  { path: "pelanggan/form", component: PelangganFormDialogComponent },
  { path: "pelanggan/form/:id", component: PelangganFormDialogComponent },
  { path: "coa", component: CoaComponent },

  // 🔥 Custom login & register route langsung
  { path: "login", component: CustomLoginComponent },
  { path: "register", component: CustomRegisterComponent },
  // 🔁 Default redirect
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "**", redirectTo: "login" },
];
const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
