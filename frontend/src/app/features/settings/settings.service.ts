import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ENVIRONMENT } from '../../core/environment.token';
import { AzureSettings } from '../azure/azure.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  getAzureSettings(): Observable<AzureSettings> {
    return this.http.get<AzureSettings>(`${this.env.apiUrl}/settings/azure`);
  }

  saveAzureSettings(data: { organization: string; patToken: string }): Observable<AzureSettings> {
    return this.http.post<AzureSettings>(`${this.env.apiUrl}/settings/azure`, data);
  }

  removeAzureSettings(): Observable<AzureSettings> {
    return this.http.delete<AzureSettings>(`${this.env.apiUrl}/settings/azure`);
  }
}
