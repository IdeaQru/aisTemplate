import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticdataComponent } from './components/layout/analyticdata/analyticdata.component';
import { SensorComponent } from './components/layout/sensor/sensor.component';
import { MapComponent } from './components/map/map.component';

const routes: Routes = [
  { path: 'home', component: MapComponent },
  { path: 'sensor', component: SensorComponent },
  { path: 'analytic', component: AnalyticdataComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
