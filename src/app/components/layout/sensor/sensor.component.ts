import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { SensorService } from '../../../services/sensor.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface SensorData {
  suhu: number;
  kelembapan: number;
  angin: number;
  tegangan: number;
}

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit, OnDestroy {
  @Input() sensorData?: SensorData;
  @Input() autoAlert: boolean = true;
  @Input() forMaps: boolean = false;
  @Input() asLegend: boolean = false;

  lastData: SensorData | null = null;
  private subscription?: Subscription;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    if (this.autoAlert && !this.forMaps && !this.asLegend) {
      this.startAutoAlert();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private startAutoAlert(): void {
    this.subscription = interval(3000)
      .pipe(switchMap(() => this.sensorService.getSensorData()))
      .subscribe({
        next: (data: SensorData) => {
          if (JSON.stringify(this.lastData) !== JSON.stringify(data)) {
            this.lastData = data;
            this.showSensorAlert(data);
          }
        },
        error: (err: any) => {
          console.error('Gagal mengambil data sensor:', err);
        }
      });
  }

  private showSensorAlert(data: SensorData): void {
    Swal.fire({
      title: '',
      html: this.generateLegendHTML(data),
      showConfirmButton: false,
      width: '400px',
      backdrop: false,
      showCloseButton: true,
      customClass: {
        popup: 'sensor-alert-popup'
      }
    });
  }

  // Method untuk generate HTML legend (untuk maps)
generateLegendHTML(data?: SensorData): string {
  const sensorData = data || this.sensorData;
  
  // Validasi yang lebih komprehensif
  if (!sensorData || 
      sensorData === null || 
      typeof sensorData.suhu === 'undefined' ||
      typeof sensorData.kelembapan === 'undefined' ||
      typeof sensorData.angin === 'undefined' ||
      typeof sensorData.tegangan === 'undefined') {
    return this.getPlaceholderHTML();
  }

  return `
    <style>
      .sensor-legend-horizontal {
        width: 100%;
        min-width: 600px;
        max-width: 800px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color:  rgba(248, 249, 250, 0.22);
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .legend-header-card {
        background-color: rgba(26, 115, 232, 0.1);
        border: 1px solid rgba(26, 115, 232, 0.2);
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 15px;
        backdrop-filter: blur(10px);
      }

      .legend-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0;
      }

      .legend-title h5 {
        margin: 0;
        color: #1a73e8;
        font-size: 16px;
        font-weight: 600;
      }

      .legend-indicator {
        width: 12px;
        height: 12px;
        background: #28a745;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      .legend-indicator.offline {
        background: #dc3545;
        animation: none;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
        }
      }

      .sensor-cards-horizontal {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: space-between;
      }

      .sensor-card-horizontal {
        display: flex;
        align-items: center;
        background-color:  rgba(248, 249, 250, 0.22);
        border: 1px solid rgba(222, 226, 230, 0.6);
        border-radius: 12px;
        padding: 12px 16px;
        flex: 1;
        min-width: 140px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(5px);
      }

      .sensor-card-horizontal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #1a73e8, #4285f4);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      .sensor-card-horizontal:hover {
        background-color: rgba(227, 242, 253, 0.9);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(26, 115, 232, 0.15);
        border-color: rgba(26, 115, 232, 0.8);
      }

      .sensor-card-horizontal:hover::before {
        transform: scaleX(1);
      }

      .sensor-icon-horizontal {
        font-size: 24px;
        margin-right: 12px;
        min-width: 30px;
        text-align: center;
      }

      .sensor-content {
        flex: 1;
        text-align: left;
      }

      .sensor-title-horizontal {
        font-size: 11px;
        color: #6c757d;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 4px;
        letter-spacing: 0.8px;
      }

      .sensor-value-horizontal {
        font-size: 16px;
        font-weight: bold;
        color: #1a73e8;
        text-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      @media (max-width: 768px) {
        .sensor-legend-horizontal {
          min-width: 100%;
          max-width: 100%;
          padding: 15px;
        }
        
        .sensor-cards-horizontal {
          flex-direction: column;
          gap: 10px;
        }
        
        .sensor-card-horizontal {
          min-width: 100%;
        }
      }

      @media (max-width: 480px) {
        .sensor-card-horizontal {
          padding: 10px 12px;
        }
        
        .sensor-icon-horizontal {
          font-size: 20px;
          margin-right: 10px;
          min-width: 25px;
        }
        
        .sensor-value-horizontal {
          font-size: 14px;
        }
      }
    </style>
    <div class="sensor-legend-horizontal">
      <div class="legend-header-card">
        <div class="legend-title">
          <h5>Data Sensor Real-time</h5>
          <div class="legend-indicator"></div>
        </div>
      </div>
      <div class="sensor-cards-horizontal">
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">🌡️</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Suhu</div>
            <div class="sensor-value-horizontal">${this.formatValue(sensorData.suhu)} °C</div>
          </div>
        </div>
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">💧</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Kelembapan</div>
            <div class="sensor-value-horizontal">${this.formatValue(sensorData.kelembapan)} %</div>
          </div>
        </div>
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">💨</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Angin</div>
            <div class="sensor-value-horizontal">${this.formatValue(sensorData.angin)} m/s</div>
          </div>
        </div>
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">🔋</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Baterai</div>
            <div class="sensor-value-horizontal">${this.formatValue(sensorData.tegangan)} %</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

getPlaceholderHTML(): string {
  return `
    <style>
      .sensor-legend-horizontal {
        width: 100%;
        min-width: 600px;
        max-width: 800px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: rgba(248, 249, 250, 0.22);
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .legend-header-card {
        background-color: rgba(220, 53, 69, 0.1);
        border: 1px solid rgba(220, 53, 69, 0.2);
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 15px;
        backdrop-filter: blur(10px);
      }

      .legend-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0;
      }

      .legend-title h5 {
        margin: 0;
        color: #dc3545;
        font-size: 16px;
        font-weight: 600;
      }

      .legend-indicator {
        width: 12px;
        height: 12px;
        background: #dc3545;
        border-radius: 50%;
      }

      .sensor-cards-horizontal {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: space-between;
      }

      .sensor-card-horizontal {
        display: flex;
        align-items: center;
        background-color: rgba(248, 249, 250, 0.22);
        border: 1px solid rgba(222, 226, 230, 0.4);
        border-radius: 12px;
        padding: 12px 16px;
        flex: 1;
        min-width: 140px;
        backdrop-filter: blur(5px);
      }

      .sensor-icon-horizontal {
        font-size: 24px;
        margin-right: 12px;
        min-width: 30px;
        text-align: center;
        opacity: 0.5;
      }

      .sensor-content {
        flex: 1;
        text-align: left;
      }

      .sensor-title-horizontal {
        font-size: 11px;
        color: #6c757d;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 4px;
        letter-spacing: 0.8px;
      }

      .sensor-value-horizontal {
        font-size: 16px;
        font-weight: bold;
        color: #6c757d;
      }
    </style>
    <div class="sensor-legend-horizontal">
      <div class="legend-header-card">
        <div class="legend-title">
          <h5>Data Sensor Real-time</h5>
          <div class="legend-indicator"></div>
        </div>
      </div>
      <div class="sensor-cards-horizontal">
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">🌡️</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Suhu</div>
            <div class="sensor-value-horizontal">-- °C</div>
          </div>
        </div>
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">💧</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Kelembapan</div>
            <div class="sensor-value-horizontal">-- %</div>
          </div>
        </div>
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">💨</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Angin</div>
            <div class="sensor-value-horizontal">-- m/s</div>
          </div>
        </div>
        <div class="sensor-card-horizontal">
          <div class="sensor-icon-horizontal">🔋</div>
          <div class="sensor-content">
            <div class="sensor-title-horizontal">Baterai</div>
            <div class="sensor-value-horizontal">-- %</div>
          </div>
        </div>
      </div>
    </div>
  `;
}




// Helper method untuk format nilai
private formatValue(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(1);
}


  // Method untuk update data (dipanggil dari maps)
  updateSensorData(data: SensorData, container: HTMLElement): void {
    this.sensorData = data;
    container.innerHTML = this.generateLegendHTML(data);
  }
}
