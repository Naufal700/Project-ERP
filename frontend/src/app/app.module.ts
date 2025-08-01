import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LOCALE_ID } from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeId from "@angular/common/locales/id";
import { NbSpinnerModule, NbLayoutModule } from "@nebular/theme";
import { NbSelectModule } from "@nebular/theme";
import { AuthLayoutComponent } from "./auth/auth-layout.component";
import { SalesQuotationDetailComponent } from "./pages/menu/penjualan/penawaran/sales-quotation-detail.component";
import { AuthInterceptor } from "./@core/interceptors/auth.interceptor";
import { SalesOrderComponent } from "./pages/menu/penjualan/sales-order/sales-order.component";
import { SalesOrderDetailComponent } from "./pages/menu/penjualan/sales-order/sales-order-detail.component";

registerLocaleData(localeId);

// Nebular Auth & Theme
import {
  NbAuthModule,
  NbPasswordAuthStrategy,
  NbAuthJWTToken,
} from "@nebular/auth";
import {
  NbInputModule,
  NbFormFieldModule,
  NbButtonModule,
  NbAlertModule,
  NbCardModule,
  NbSidebarModule,
  NbMenuModule,
  NbDatepickerModule,
  NbDialogModule,
  NbWindowModule,
  NbToastrModule,
  NbChatModule,
  NbIconModule,
} from "@nebular/theme";

// Core App
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";

// Custom Component
import { CustomLoginComponent } from "./auth/custom-login/custom-login.component";
import { CustomRegisterComponent } from "./auth/custom-register/custom-register.component";

@NgModule({
  declarations: [
    AppComponent,
    CustomLoginComponent,
    CustomRegisterComponent,
    AuthLayoutComponent,
    SalesQuotationDetailComponent,
    SalesOrderComponent,
    SalesOrderDetailComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    NbInputModule,
    NbFormFieldModule,
    NbButtonModule,
    NbAlertModule,
    NbCardModule,
    AppRoutingModule,
    NbSpinnerModule,
    NbLayoutModule,
    NbIconModule,
    NbSelectModule,
    ReactiveFormsModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: "AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY",
    }),

    // Auth Config
    NbAuthModule.forRoot({
      strategies: [
        NbPasswordAuthStrategy.setup({
          name: "email",
          baseEndpoint: "http://localhost:8000/api", // ganti sesuai Laravel API
          login: {
            endpoint: "/login",
            method: "post",
          },
          register: {
            endpoint: "/register",
            method: "post",
          },
          token: {
            class: NbAuthJWTToken,
            key: "token", // pastikan key sesuai response dari Laravel
          },
        }),
      ],
      forms: {
        login: {
          redirectDelay: 0,
          strategy: "email",
          rememberMe: false,
          showMessages: {
            success: true,
            error: true,
          },
        },
        register: {
          redirectDelay: 0,
          strategy: "email",
          showMessages: {
            success: true,
            error: true,
          },
        },
        logout: {
          redirectDelay: 0,
          strategy: "email",
          redirect: {
            success: "/auth/login",
            failure: null,
          },
        },
      },
    }),

    // Core
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    NbDialogModule.forRoot(),
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: "id-ID",
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],

  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
