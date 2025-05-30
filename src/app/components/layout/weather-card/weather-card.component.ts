import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SensorService } from '../../../services/sensor.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface WeatherData {
  kategoriCuaca: string;
  kondisi: string;
  lastUpdate?: string;
}

@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.css']
})
export class WeatherCardComponent implements OnInit, OnDestroy {
  @Input() weatherData?: WeatherData;
  @Input() autoUpdate: boolean = true;
  @Input() forMaps: boolean = false;

  private updateSubscription?: Subscription;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.loadWeatherData();
    
    if (this.autoUpdate) {
      this.startAutoUpdate();
    }
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private loadWeatherData(): void {
    // Gunakan API kategori cuaca langsung
    this.sensorService.getkategoriCuaca().subscribe({
      next: (data) => {
        this.weatherData = {
          kategoriCuaca: data.kategoriCuaca,
          kondisi: this.getKondisiFromKategori(data.kategoriCuaca),
          lastUpdate: new Date().toISOString()
        };
      },
      error: (err) => console.error('Error loading weather data:', err)
    });
  }

  private startAutoUpdate(): void {
    this.updateSubscription = interval(10000) // Update setiap 10 detik
      .pipe(switchMap(() => this.sensorService.getkategoriCuaca()))
      .subscribe({
        next: (data) => {
          this.weatherData = {
            kategoriCuaca: data.kategoriCuaca,
            kondisi: this.getKondisiFromKategori(data.kategoriCuaca),
            lastUpdate: new Date().toISOString()
          };
        },
        error: (err) => console.error('Error updating weather data:', err)
      });
  }

  // Method untuk mendapatkan kondisi berdasarkan kategori dari API
  public getKondisiFromKategori(kategori: string): string {
    const kategoriLower = kategori.toLowerCase();
    
    if (kategoriLower.includes('cerah')) return 'Cerah';
    if (kategoriLower.includes('berawan')) return 'Berawan';
    if (kategoriLower.includes('mendung')) return 'Mendung';
    if (kategoriLower.includes('hujan')) return 'Hujan';
    if (kategoriLower.includes('badai')) return 'Badai';
    if (kategoriLower.includes('kabut')) return 'Berkabut';
    if (kategoriLower.includes('panas')) return 'Panas';
    if (kategoriLower.includes('dingin')) return 'Dingin';
    if (kategoriLower.includes('normal')) return 'Normal';
    
    return kategori; // Return kategori asli jika tidak match
  }

  public getWeatherIcon(): string {
    if (!this.weatherData) return '🌤️';
    
    const kategori = this.weatherData.kategoriCuaca.toLowerCase();
    
    if (kategori.includes('cerah')) return '☀️';
    if (kategori.includes('berawan')) return '⛅';
    if (kategori.includes('mendung')) return '☁️';
    if (kategori.includes('hujan')) return '🌧️';
    if (kategori.includes('badai')) return '⛈️';
    if (kategori.includes('kabut')) return '🌫️';
    if (kategori.includes('panas')) return '🔥';
    if (kategori.includes('dingin')) return '❄️';
    if (kategori.includes('salju')) return '🌨️';
    if (kategori.includes('angin')) return '💨';
    
    return '🌤️'; // Default icon
  }

  public formatLastUpdate(): string {
    if (!this.weatherData?.lastUpdate) return '';
    
    const date = new Date(this.weatherData.lastUpdate);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Method untuk generate HTML (untuk maps)
  public generateWeatherHTML(): string {
    if (!this.weatherData) {
      return this.getPlaceholderHTML();
    }

    return `
      <style>
        .weather-card-container {
          background: rgba(248, 249, 250, 0.22);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 350px;
          min-width: 300px;
        }

        .weather-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(26, 115, 232, 0.2);
        }

        .weather-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .weather-title h3 {
          margin: 0;
          color: #1a73e8;
          font-size: 18px;
          font-weight: 600;
        }

        .weather-icon {
          font-size: 24px;
        }

        .weather-status {
          background: rgba(26, 115, 232, 0.1);
          color: #1a73e8;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .weather-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid rgba(222, 226, 230, 0.6);
          font-size: 12px;
          color: #6c757d;
        }

        .weather-category {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
      </style>
      <div class="weather-card-container">
        <div class="weather-header">
          <div class="weather-title">
            <span class="weather-icon">${this.getWeatherIcon()}</span>
            <h3>Cuaca Saat Ini</h3>
          </div>
          <div class="weather-status">${this.weatherData.kondisi}</div>
        </div>
        
        <div class="weather-footer">
          <span>Update terakhir: ${this.formatLastUpdate()}</span>
          <span class="weather-category">${this.weatherData.kategoriCuaca}</span>
        </div>
      </div>
    `;
  }

  public getPlaceholderHTML(): string {
    return `
      <style>
        .weather-card-container {
          background: rgba(248, 249, 250, 0.22);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 350px;
          min-width: 300px;
        }

        .weather-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(220, 53, 69, 0.2);
        }

        .weather-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .weather-title h3 {
          margin: 0;
          color: #dc3545;
          font-size: 18px;
          font-weight: 600;
        }

        .weather-status {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .weather-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid rgba(222, 226, 230, 0.6);
          font-size: 12px;
          color: #6c757d;
        }

        .weather-category {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
      </style>
      <div class="weather-card-container">
        <div class="weather-header">
          <div class="weather-title">
            <span>🌤️</span>
            <h3>Cuaca Saat Ini</h3>
          </div>
          <div class="weather-status">Loading...</div>
        </div>
        
        <div class="weather-footer">
          <span>Menunggu data...</span>
          <span class="weather-category">Offline</span>
        </div>
      </div>
    `;
  }
}
