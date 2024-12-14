import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private apiUrl = 'http://localhost:3000/locations';
  private markers: any[] = []; // Marker'lar için bir dizi tanımlayın

  constructor(private http: HttpClient) {}

  getMarkers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addMarker(marker: { lat: number; lng: number; note: string }): Observable<any> {
    return this.http.post(this.apiUrl, marker);
  }

  deleteMarker(lat: number, lng: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?lat=${lat}&lng=${lng}`);
  }

  updateMarker(marker: { lat: number; lng: number; note: string }): Observable<any> {
    return this.http.put(this.apiUrl, marker);
  }
}
