import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import {
  NbMenuModule,
  NbCardModule,
  NbInputModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbSelectModule,
} from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';

// Import komponen pelanggan
import { PelangganComponent } from './master/pelanggan/pelanggan.component';
import { PelangganFormComponent } from './master/pelanggan/pelanggan-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbSelectModule,        
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    NgxPaginationModule,
  ],
  declarations: [
    PagesComponent,
    PelangganComponent,
    PelangganFormComponent,
  ],
})
export class PagesModule {}
