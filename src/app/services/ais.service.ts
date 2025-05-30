import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AisService {
  private baseUrl = "http://localhost:5000/api/ais";

  constructor(private http: HttpClient) {}

  // Mengambil semua data kapal (kecuali type 4 & 21)
  getShipData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // Mengambil data buoy (type 21 - AtoN)
  getBuoys(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/buoy`);
  }

  // Mengambil data type 4 (station or base info)
  getVTS(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/VTS`);
  }
}
