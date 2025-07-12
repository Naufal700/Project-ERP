import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PelangganComponent } from './pelanggan.component';
import { PelangganFormComponent } from './pelanggan-form.component';

const routes: Routes = [
  { path: '', component: PelangganComponent },
  { path: 'form', component: PelangganFormComponent },
  { path: 'form/:id', component: PelangganFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PelangganRoutingModule {}
