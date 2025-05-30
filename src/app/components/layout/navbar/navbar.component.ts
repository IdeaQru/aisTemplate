import { Component, OnInit } from '@angular/core';
import { SensorService } from 'src/app/services/sensor.service'; // ✅ perbaiki path

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  kategoriCuaca: string = 'Memuat...';

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.loadkategoriCuaca();
  }

  loadkategoriCuaca() {
    this.sensorService.getkategoriCuaca().subscribe({
      next: (res: { kategoriCuaca: string }) => {
        this.kategoriCuaca = res.kategoriCuaca;
      },
      error: (err: any) => {
        console.error('[ERROR] Gagal mengambil kategoriCuaca:', err);
        this.kategoriCuaca = 'Gagal memuat';
      }
    });
  }
}
