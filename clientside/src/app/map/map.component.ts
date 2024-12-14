import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../services/marker.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  map!: L.Map;
  selectedCoords: L.LatLng | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();

  constructor(private markerService: MarkerService) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMarkers();
  }

  private initMap(): void {
    this.map = L.map('map').setView([39.92077, 32.85411], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => this.handleMapClick(e));
  }

  private loadMarkers2(): void {
    this.markerService.getMarkers().subscribe({
      next: (markers) => {
        markers.forEach((marker) => {
          const { lat, lng, note } = marker;
          const customMarker = L.marker([lat, lng], { icon: this.createCustomIcon() });
          customMarker
            .bindPopup(`<b>Koordinatlar:</b> Lat: ${lat}, Lng: ${lng}<br><b>Not:</b> ${note || 'Belirtilmedi'}`)
            .addTo(this.markersLayer);
        });
      },
      error: (err) => console.error('Marker yükleme hatası:', err),
    });
  }
  private loadMarkers(): void {
    this.markerService.getMarkers().subscribe({
      next: (markers) => {
        markers.forEach((marker) => {
          const { lat, lng, note } = marker;
          const customMarker = L.marker([lat, lng], { icon: this.createCustomIcon() });
          const popupContent = `
            <div>
              <strong>Koordinatlar:</strong> <p>Lat: ${lat}, Lng: ${lng}</p>
              <textarea id="editNoteInput" placeholder="Not düzenleyin...">${note || ''}</textarea><br>
              <button id="updateNote">Güncelle</button>
              <button id="deleteMarker">Sil</button>
            </div>
          `;

          customMarker
            .bindPopup(popupContent)
            .addTo(this.markersLayer);

          customMarker.on('popupopen', () => {
            document.getElementById('updateNote')?.addEventListener('click', () =>
              this.updateMarker(lat, lng)
            );
            document.getElementById('deleteMarker')?.addEventListener('click', () =>
              this.deleteMarker(lat, lng)
            );
          });
        });
      },
      error: (err) => console.error('Marker yükleme hatası:', err),
    });
  }

  private handleMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;
    this.selectedCoords = e.latlng;

    const popupContent = `
      <div>
        <strong>Koordinatlar:</strong> <p>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</p>
        <textarea id="noteInput" placeholder="Not ekleyin..."></textarea><br>
        <button id="saveNote">Kaydet</button>
        <button id="deleteMarker">Sil</button>
      </div>
    `;

    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(popupContent)
      .openOn(this.map);

    setTimeout(() => {
      document.getElementById('saveNote')?.addEventListener('click', () => this.saveNote());
      document.getElementById('deleteMarker')?.addEventListener('click', () => this.deleteMarker(lat, lng));
    });
  }

  private saveNote(): void {
    const noteInput = (document.getElementById('noteInput') as HTMLTextAreaElement)?.value;
    if (this.selectedCoords && noteInput) {
      const data = {
        lat: this.selectedCoords.lat,
        lng: this.selectedCoords.lng,
        note: noteInput,
      };

      this.markerService.addMarker(data).subscribe({
        next: () => {
          alert('Not başarıyla kaydedildi!');
          this.map.closePopup(); // Popup'ı kapat
          this.loadMarkers(); // Markerları yeniden yükle
        },
        error: (err) => console.error('Not kaydedilemedi:', err),
      });
    } else {
      alert('Lütfen bir not girin!');
    }
  }
  private updateMarker(lat: number, lng: number): void {
    const noteInput = (document.getElementById('editNoteInput') as HTMLTextAreaElement)?.value;

    if (noteInput) {
      const updatedData = { lat, lng, note: noteInput };

      this.markerService.updateMarker(updatedData).subscribe({
        next: () => {
          alert('Not başarıyla güncellendi!');
          this.map.closePopup(); // Popup'ı kapat
          this.loadMarkers(); // Markerları yeniden yükle
        },
        error: (err) => console.error('Not güncellenemedi:', err),
      });
    } else {
      alert('Not boş olamaz!');
    }
  }
  private deleteMarker2(): void {
    if (this.selectedCoords) {
      this.markerService.deleteMarker(this.selectedCoords.lat, this.selectedCoords.lng).subscribe({
        next: () => {
          alert('Marker başarıyla silindi!');
          this.loadMarkers();
        },
        error: (err) => console.error('Marker silinemedi:', err),
      });
    }
  }

  private deleteMarker(lat: number, lng: number): void {
    this.markerService.deleteMarker(lat, lng).subscribe({
      next: () => {
        alert('Marker başarıyla silindi!');
        this.map.closePopup(); // Popup'ı kapat
        this.loadMarkers(); // Markerları yeniden yükle
      },
      error: (err) => console.error('Marker silinemedi:', err),
    });
  }

  private createCustomIcon(): L.Icon {
    return L.icon({
      iconUrl: '/assets/icons/placeholder.png',
      iconSize: [25, 25],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  }
}
