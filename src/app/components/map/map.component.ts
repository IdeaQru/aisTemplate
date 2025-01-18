import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: any;

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Inisialisasi peta tanpa kontrol zoom bawaan
    this.map = L.map('map', {
      center: [-7.3172214, 112.5942126],
      zoom: 9,
      zoomControl: false // Nonaktifkan kontrol zoom bawaan
    });

    // Tambahkan lapisan peta
    L.tileLayer('https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}@2x.jpg?key=GDfjtnu7IHfNAGwlcHjN', {
      maxZoom: 20,
      attribution: '&copy; MapTiler'
    }).addTo(this.map);

    // Tambahkan kontrol zoom di kanan bawah
    L.control.zoom({
      position: 'topright' // Atur posisi kontrol zoom
    }).addTo(this.map);
  }
}
