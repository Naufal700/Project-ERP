import { NgModule } from "@angular/core";
import { Routes, RouterModule, ExtraOptions } from "@angular/router";
import { AuthLayoutComponent } from "./auth/auth-layout.component";
import { CustomLoginComponent } from "./auth/custom-login/custom-login.component";
import { CustomRegisterComponent } from "./auth/custom-register/custom-register.component";
import { AuthGuard } from "./auth/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      { path: "login", component: CustomLoginComponent },
      { path: "register", component: CustomRegisterComponent },
    ],
  },
  {
    path: "pages",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./pages/pages.module").then((m) => m.PagesModule),
  },
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
