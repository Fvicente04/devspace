// Tests that GithubService makes correct HTTP calls for each endpoint
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { GithubService } from './github.service';
import { ENVIRONMENT } from '../../core/environment.token';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GithubService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getPullRequests() makes GET to /github/prs', () => {
    service.getPullRequests().subscribe();
    const req = httpMock.expectOne('http://localhost:3000/github/prs');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getIssues() makes GET to /github/issues', () => {
    service.getIssues().subscribe();
    const req = httpMock.expectOne('http://localhost:3000/github/issues');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getActivity() makes GET to /github/activity', () => {
    service.getActivity().subscribe();
    const req = httpMock.expectOne('http://localhost:3000/github/activity');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
