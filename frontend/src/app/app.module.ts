import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Nebular Auth & Theme
import {
  NbAuthModule,
  NbPasswordAuthStrategy,
  NbAuthJWTToken,
} from '@nebular/auth';
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
} from '@nebular/theme';

// Core App
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';

// Custom Component
import { CustomLoginComponent } from './auth/custom-login/custom-login.component';
import { CustomRegisterComponent } from './auth/custom-register/custom-register.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomLoginComponent,
    CustomRegisterComponent,
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
    NbIconModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),

    // Auth Config
    NbAuthModule.forRoot({
      strategies: [
        NbPasswordAuthStrategy.setup({
          name: 'email',
          baseEndpoint: 'http://localhost:8000/api', // ganti sesuai Laravel API
          login: {
            endpoint: '/login',
            method: 'post',
          },
          register: {
            endpoint: '/register',
            method: 'post',
          },
          token: {
            class: NbAuthJWTToken,
            key: 'token', // pastikan key sesuai response dari Laravel
          },
        }),
      ],
      forms: {
        login: {
          redirectDelay: 0,
          strategy: 'email',
          rememberMe: false,
          showMessages: {
            success: true,
            error: true,
          },
        },
        register: {
          redirectDelay: 0,
          strategy: 'email',
          showMessages: {
            success: true,
            error: true,
          },
        },
        logout: {
          redirectDelay: 0,
          strategy: 'email',
          redirect: {
            success: '/auth/login',
            failure: null,
          },
        },
      },
    }),

    // Core
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
