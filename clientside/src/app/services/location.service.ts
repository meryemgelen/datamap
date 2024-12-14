import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LocationService {
    private apiUrl = 'http://localhost:3000/locations';

    constructor(private http: HttpClient) {}

    getLocations(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    addLocation(location: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, location);
    }
}
