import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbCardModule, NbButtonModule, NbInputModule, NbIconModule } from '@nebular/theme';
import { PelangganRoutingModule } from './pelanggan-routing.module';
import { PelangganComponent } from './pelanggan.component';
import { PelangganFormComponent } from './pelanggan-form.component';

@NgModule({
  declarations: [PelangganComponent, PelangganFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    PelangganRoutingModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule,
  ],
})
export class PelangganModule {}
