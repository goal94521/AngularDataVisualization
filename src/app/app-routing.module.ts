import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BasicChartComponent} from "./d3/basic-chart/basic-chart.component";


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'main',
  },
  {
    path: 'main',
    component: BasicChartComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
