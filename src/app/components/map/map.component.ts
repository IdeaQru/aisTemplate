import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { AisService } from 'src/app/services/ais.service';
import { SensorService } from 'src/app/services/sensor.service';
import { SensorComponent } from 'src/app/components/layout/sensor/sensor.component';
import { WeatherCardComponent } from '../layout/weather-card/weather-card.component';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import 'leaflet-rotatedmarker';

interface SensorData {
  suhu: number;
  kelembapan: number;
  angin: number;
  tegangan: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  private map: any;
  private shipMarkers: L.Marker[] = [];
  shipData: any[] = [];
  private pollingInterval: any;
  private defaultIconSize = 32;
  private buoyMarkers: L.Marker[] = [];
  private vtsMarkers: L.Marker[] = [];
  private buoyPositions: L.LatLng[] = [];
  private vtsPositions: L.LatLng[] = [];
  
  // Perbaikan: Inisialisasi properti dengan definite assignment assertion
  private sensorLegendControl!: L.Control;
  private sensorComponent!: SensorComponent;
 
  private sensorContainer!: HTMLElement;
   private weatherCardControl!: L.Control;
  private weatherComponent!: WeatherCardComponent;
  private sensorPollingSubscription?: Subscription;

  constructor(
    private aisService: AisService,
    private sensorService: SensorService
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadShipData();
    this.setupPolling();
    this.setupZoomHandler();
    this.loadBuoys();
    this.loadVTS();
    this.addSensorLegendToMap(); // Tambahkan setelah map diinisialisasi
    this.addWeatherCardToMap(); // Tambahkan ini
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.sensorPollingSubscription) {
      this.sensorPollingSubscription.unsubscribe();
    }
    if (this.sensorLegendControl && this.map) {
      this.map.removeControl(this.sensorLegendControl);
    }
  }

private addSensorLegendToMap(): void {
  if (!this.map) {
    console.error('Map not initialized');
    return;
  }

  // Buat instance sensor component SEBELUM digunakan
  this.sensorComponent = new SensorComponent(this.sensorService);
  this.sensorComponent.asLegend = true;
  this.sensorComponent.autoAlert = false;
  this.sensorComponent.forMaps = true;

  // Buat custom control menggunakan L.Control.extend
  const SensorLegendControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },

    onAdd: (map: any) => {
      // Buat container div
      const container = L.DomUtil.create('div', 'sensor-legend-container');
      
      // Prevent map interaction when clicking on legend
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      
      // Set initial HTML SETELAH sensorComponent diinisialisasi
      container.innerHTML = this.sensorComponent.generateLegendHTML();
      
      // Panggil updateSensorData setiap 5 detik
      this.sensorPollingSubscription = interval(5000).pipe(
        switchMap(() => this.sensorService.getSensorData())
      ).subscribe((data: SensorData) => {
        this.sensorComponent.updateSensorData(data, container);
      });
      
      return container;
    },

    onRemove: (map: any) => {
      // Cleanup jika diperlukan
    }
  });

  // Buat instance control dan tambahkan ke map
  this.sensorLegendControl = new SensorLegendControl();
  this.sensorLegendControl.addTo(this.map);
}

  private setupPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.loadShipData();
    }, 10000);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-7.3172214, 112.5942126],
      zoom: 9,
      zoomControl: false,
      preferCanvas: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
  }

  private setupZoomHandler(): void {
    this.map.on('zoomend', () => {
      this.updateAllMarkers();
    });
  }

  private loadShipData(): void {
    this.aisService.getShipData().subscribe({
      next: (data) => {
        console.log('Data kapal:', data);
        this.shipData = data;
        this.addShipsToMap(this.shipData);
      },
      error: (err) => console.error('Error fetching ship data:', err)
    });
  }

  private createShipMarker(ship: any): L.Marker {
    const { position, movement, type } = ship;
    const lat = parseFloat(position?.lat) || 0;
    const lon = parseFloat(position?.lon) || 0;
    const rotationAngle = parseFloat(movement?.heading) || parseFloat(movement?.course) || 0;

    const marker = L.marker([lat, lon], {
      icon: this.createDivIcon(type),
      rotationAngle,
      rotationOrigin: 'center center'
    } as any);

    this.addPopup(marker, ship);
    return marker;
  }

  private createDivIcon(shipType: string): L.DivIcon {
    const size = this.calculateIconSize();
    const iconUrl = this.getIconPath(shipType);

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          transform: translate(-50%, -50%);
          display: flex;
        ">
          <img 
            src="${iconUrl}" 
            style="
              width: 100%;
              height: 100%;
              transform: rotate(${this.map.getBearing?.() || 0}deg);
            "
          />
        </div>
      `,
      className: 'dynamic-ship-icon',
      iconSize: [size/1.8, size/1.8],
      iconAnchor: [size/3.5, size/3.5],
      popupAnchor: [0, -size/2.5]
    });
  }

  private calculateIconSize(): number {
    const zoom = this.map.getZoom();
    return Math.min(48, Math.max(16, zoom * 2.5));
  }

  private getIconPath(shipType: string): string {
    const iconMap: { [key: string]: string } = {
      'Cargo Vessels': 'CargoVessels.png',
      'Tankers': 'Tangkers.png',
      'Passenger Vessels': 'Pessenger.png',
      'Fishing': 'fhising.png',
      'Tugs & Special Craft': 'Tugs.png',
      'High Speed Craft': 'High.png',
      'Navigation Aids': 'NavigationAids.png',
      'Pleasure Craft': 'Pleasure.png',
      'Unspecified Ships': 'default.png',
      'Unknown': 'default.png',
      'Buoy Merah': 'buoy_merah.png',
      'Buoy Hijau': 'buoy_hijau.png',
      'VTS': 'VTS.png',
      'Buoy Default': 'BuoyDefault.png'
    };
    return `assets/Ships/${iconMap[shipType] || 'default.png'}`;
  }

  private getBuoyIconType(shipName: string): string {
    const upperName = shipName.toUpperCase();
    if (upperName.includes('BUOY MERAH')) {
      return 'Buoy Merah';
    } else if (upperName.includes('BUOY HIJAU')) {
      return 'Buoy Hijau';
    } else {
      return 'Buoy Default';
    }
  }

  private getVTSIconType(): string {
    return 'VTS';
  }

  private formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
      tahun: 31536000,
      bulan: 2592000,
      minggu: 604800,
      hari: 86400,
      jam: 3600,
      menit: 60,
      detik: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? '' : ''} yang lalu`;
      }
    }

    return 'Baru saja';
  }

  private addPopup(marker: L.Marker, ship: any): void {
    const { mmsi, shipName, position, movement, type, lastUpdate, shiptypecode } = ship;

    marker.bindPopup(`
      <div class="ship-popup">
        <h4>${shipName}</h4>
        <div class="ship-info">
          <div><b>MMSI:</b> ${mmsi}</div>
          <div><b>Jenis:</b> ${type}</div>
          <div><b>Posisi:</b><br>
            ${position?.lat}, ${position?.lon}
          </div>
          <div><b>typecode:</b><br>
            ${shiptypecode}
          </div>
          <div><b>Kecepatan:</b> ${movement?.speed || 0} knot</div>
          <div><b>Arah:</b> ${movement?.course || 0}°</div>
          <div><b>Update Terakhir:</b><br>${this.formatRelativeTime(lastUpdate)}</div>
        </div>
      </div>
    `);
  }

  private loadBuoys(): void {
    this.aisService.getBuoys().subscribe({
      next: (data) => {
        this.buoyPositions = [];
        this.buoyMarkers.forEach(m => this.map.removeLayer(m));
        this.buoyMarkers = data.map(buoy => {
          const lat = parseFloat(buoy.position?.lat) || 0;
          const lon = parseFloat(buoy.position?.lon) || 0;

          if (lat && lon && lat !== 0 && lon !== 0) {
            this.buoyPositions.push(L.latLng(lat, lon));
          }

          const iconType = this.getBuoyIconType(buoy.shipName);

          const marker = L.marker([lat, lon], {
            icon: this.createDivIcon(iconType)
          });

          marker.bindPopup(`
            <div><b>Buoy:</b> ${buoy.shipName}</div>
            <div><b>MMSI:</b> ${buoy.mmsi}</div>
            <div><b>Posisi:</b> ${lat}, ${lon}</div>
            <div><b>Update Terakhir:</b><br>${this.formatRelativeTime(buoy.lastUpdate)}</div>
          `);

          marker.addTo(this.map);
          return marker;
        });
      },
      error: (err) => console.error('Error fetching buoy data:', err)
    });
  }

  private loadVTS(): void {
    this.aisService.getVTS().subscribe({
      next: (data) => {
        this.vtsPositions = [];
        this.vtsMarkers.forEach(m => this.map.removeLayer(m));
        this.vtsMarkers = data.map(vts => {
          const lat = parseFloat(vts.position?.lat) || 0;
          const lon = parseFloat(vts.position?.lon) || 0;

          const iconType = this.getVTSIconType();
          this.vtsPositions.push(L.latLng(lat, lon));

          const marker = L.marker([lat, lon], {
            icon: this.createDivIcon(iconType)
          });

          marker.bindPopup(`
            <div><b>VTS:</b> ${vts.shipname}</div>
            <div><b>MMSI:</b> ${vts.mmsi}</div>
            <div><b>Posisi:</b> ${lat}, ${lon}</div>
            <div><b>Update Terakhir:</b><br>${this.formatRelativeTime(vts.lastUpdate)}</div>
          `);

          marker.addTo(this.map);
          return marker;
        });
      },
      error: (err) => console.error('Error fetching VTS data:', err)
    });
  }

  private addShipsToMap(ships: any[]): void {
    this.shipMarkers.forEach(m => this.map.removeLayer(m));
    this.shipMarkers = [];
    const avoidZones = [...this.buoyPositions, ...this.vtsPositions];

    this.shipMarkers = ships
      .filter(ship => {
        const lat = parseFloat(ship.position?.lat);
        const lon = parseFloat(ship.position?.lon);
        if (!lat || !lon) return false;

        const shipPos = L.latLng(lat, lon);
        const tooClose = avoidZones.some(p => p.distanceTo(shipPos) < 10);

        return !tooClose;
      })
      .map(ship => {
        const marker = this.createShipMarker(ship);
        marker.addTo(this.map);
        return marker;
      });
  }

  private updateAllMarkers(): void {
    this.shipMarkers.forEach(marker => {
      const content = (marker as any)._popup?.getContent();
      const match = content?.match(/Jenis:<\/b> (.*?)</);
      const shipType = match ? match[1] : 'Unknown';
      if (shipType) {
        marker.setIcon(this.createDivIcon(shipType));
      }
    });
  }

  selectShip(ship: any): void {
    console.log('Selected ship:', ship);
  }
  private addWeatherCardToMap(): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    // Buat instance weather component
    this.weatherComponent = new WeatherCardComponent(this.sensorService);
    this.weatherComponent.autoUpdate = true;
    this.weatherComponent.forMaps = true;

    // Buat custom control
    const WeatherCardControl = L.Control.extend({
      options: {
        position: 'topright' // Posisi di atas kanan
      },

      onAdd: (map: any) => {
        const container = L.DomUtil.create('div', 'weather-card-container-map');
        
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        
        // Set initial HTML
        container.innerHTML = this.weatherComponent.getPlaceholderHTML();
        
        // Load data dan start polling
        this.loadAndStartWeatherPolling(container);
        
        return container;
      },

      onRemove: (map: any) => {
        // Cleanup
      }
    });

    this.weatherCardControl = new WeatherCardControl();
    this.weatherCardControl.addTo(this.map);
  }

private loadAndStartWeatherPolling(container: HTMLElement): void {
  // Load initial data langsung dari API kategori cuaca
  this.sensorService.getkategoriCuaca().subscribe({
    next: (data) => {
      this.weatherComponent.weatherData = {
        kategoriCuaca: data.kategoriCuaca,
        kondisi: this.weatherComponent.getKondisiFromKategori(data.kategoriCuaca),
        lastUpdate: new Date().toISOString()
      };
      container.innerHTML = this.weatherComponent.generateWeatherHTML();
    },
    error: (err) => {
      console.error('Error loading weather data:', err);
    }
  });

  // Start polling langsung ke API kategori cuaca
  interval(10000)
    .pipe(switchMap(() => this.sensorService.getkategoriCuaca()))
    .subscribe({
      next: (data) => {
        this.weatherComponent.weatherData = {
          kategoriCuaca: data.kategoriCuaca,
          kondisi: this.weatherComponent.getKondisiFromKategori(data.kategoriCuaca),
          lastUpdate: new Date().toISOString()
        };
        container.innerHTML = this.weatherComponent.generateWeatherHTML();
      },
      error: (err) => {
        console.error('Error updating weather data:', err);
      }
    });
}

}
