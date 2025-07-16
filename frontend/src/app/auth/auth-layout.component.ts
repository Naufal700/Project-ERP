import { Component } from "@angular/core";

@Component({
  selector: "app-auth-layout",
  template: `
    <nb-layout windowMode>
      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>
  `,
})
export class AuthLayoutComponent {}
