// Tests that SettingsService makes correct HTTP calls for Azure DevOps PAT management
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ENVIRONMENT } from '../../core/environment.token';
import { SettingsService } from './settings.service';
import { AzureSettings } from '../azure/azure.models';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };
const connected: AzureSettings = { connected: true, organization: 'softworks-workforce' };
const disconnected: AzureSettings = { connected: false, organization: null };

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAzureSettings() makes GET to /settings/azure', () => {
    service.getAzureSettings().subscribe((result) => expect(result).toEqual(connected));
    const req = httpMock.expectOne('http://localhost:3000/settings/azure');
    expect(req.request.method).toBe('GET');
    req.flush(connected);
  });

  it('saveAzureSettings(data) makes POST to /settings/azure with data', () => {
    const data = { organization: 'softworks-workforce', patToken: 'my-pat' };
    service.saveAzureSettings(data).subscribe((result) => expect(result).toEqual(connected));
    const req = httpMock.expectOne('http://localhost:3000/settings/azure');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(connected);
  });

  it('removeAzureSettings() makes DELETE to /settings/azure', () => {
    service.removeAzureSettings().subscribe((result) => expect(result).toEqual(disconnected));
    const req = httpMock.expectOne('http://localhost:3000/settings/azure');
    expect(req.request.method).toBe('DELETE');
    req.flush(disconnected);
  });
});
