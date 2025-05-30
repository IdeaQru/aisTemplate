import { Component } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Swal from 'sweetalert2';

// Register Chart.js modules
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-analyticdata',
  templateUrl: './analyticdata.component.html',
  styleUrls: ['./analyticdata.component.css']
})
export class AnalyticdataComponent {
  constructor() {}

  ngOnInit(): void {
    this.showAnalyticPopup();
  }

  showAnalyticPopup() {
    Swal.fire({
      title: 'Analitik Data Sensor',
 html: `
  <style>
    .chart-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 10px;
    }

    canvas {
      width: 100% !important;
      height: auto !important;
      background: #fff;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .chart-grid {
        grid-template-columns: 1fr; /* jadi 1 kolom saat di HP */
      }
    }
  </style>
  <div class="chart-grid">
    <canvas id="batteryChart"></canvas>
    <canvas id="temperatureChart"></canvas>
    <canvas id="humidityChart"></canvas>
    <canvas id="windChart"></canvas>
  </div>
`
,
      didOpen: () => {
        setTimeout(() => this.renderCharts(), 100); // Delay to ensure canvas is mounted
      },
      width: '95%',
      showConfirmButton: false,
      showCloseButton: true,
      backdrop: false,
    });
  }

  renderCharts() {
    new Chart('batteryChart', {
      type: 'bar',
      data: {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00'],
        datasets: [{
          label: 'Battery (%)',
          data: [100, 95, 88, 80, 75, 65, 60],
          borderColor: '#f44336',
        }]
      },
    });

    new Chart('temperatureChart', {
      type: 'line',
      data: {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00'],
        datasets: [{
          label: 'Suhu (°C)',
          data: [22, 21, 23, 26, 30, 31, 28],
          borderColor: '#f44336',
          fill: false,
          tension: 0.4
        }]
      },
    });

    new Chart('humidityChart', {
      type: 'line',
      data: {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00'],
        datasets: [{
          label: 'Kelembapan (%)',
          data: [80, 82, 78, 65, 60, 58, 62],
          backgroundColor: '#4caf50',
          fill: false,
          tension: 0.4
        }]
      },
    });

    new Chart('windChart', {
      type: 'radar',
      data: {
        labels: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        datasets: [{
          label: 'Kecepatan Angin (km/h)',
          data: [10, 14, 9, 11, 13, 8, 12, 7],
          backgroundColor: 'rgba(255, 193, 7, 0.4)',
          borderColor: '#ffc107'
        }]
      },
    });
  }
}
