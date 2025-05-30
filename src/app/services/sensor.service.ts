import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SensorData {
  suhu: number;
  kelembapan: number;
  angin: number;
  tegangan: number;
}

// ✅ Tambahkan interface untuk sensor dengan posisi
export interface SensorWithPosition {
  id: string;
  name: string;
  lat: number;
  lon: number;
  suhu: number;
  kelembapan: number;
  angin: number;
  tegangan: number;
  status: 'online' | 'offline';
  lastUpdate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private apiUrl = 'http://localhost:5000/api/pesan8';

  constructor(private http: HttpClient) {}

  getSensorData(): Observable<SensorData> {
    return this.http.get<SensorData>(this.apiUrl);
  }

  // ✅ Method yang sudah ada
  getkategoriCuaca(): Observable<{ kategoriCuaca: string }> {
    return this.http.get<{ kategoriCuaca: string }>('http://localhost:5000/api/kategori-cuaca');
  }
  
}
