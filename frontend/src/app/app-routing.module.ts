import { ExtraOptions, RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import {
  NbAuthComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
} from "@nebular/auth";
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
  {
    path: "coa",
    component: CoaComponent, // pastikan ini nama komponennya
  },
  {
    path: "auth",
    component: NbAuthComponent,
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      { path: "login", component: CustomLoginComponent },
      { path: "register", component: CustomRegisterComponent },
      { path: "logout", component: NbLogoutComponent },
      { path: "request-password", component: NbRequestPasswordComponent },
      { path: "reset-password", component: NbResetPasswordComponent },
    ],
  },
  { path: "", redirectTo: "auth/login", pathMatch: "full" },
  { path: "**", redirectTo: "auth/login" },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
