// Tests that AzureService makes correct HTTP calls to the Azure DevOps proxy endpoints
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ENVIRONMENT } from '../../core/environment.token';
import { AzureService } from './azure.service';
import { AzureWorkItem, AzurePullRequest, AzurePipeline, AzureCommit } from './azure.models';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('AzureService', () => {
  let service: AzureService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AzureService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    service = TestBed.inject(AzureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getWorkItems() makes GET to /azure/workitems', () => {
    const items: AzureWorkItem[] = [{ id: 1, title: 'Fix bug', type: 'Bug', state: 'Active', url: 'https://dev.azure.com/item/1' }];
    service.getWorkItems().subscribe((result) => expect(result).toEqual(items));
    const req = httpMock.expectOne('http://localhost:3000/azure/workitems');
    expect(req.request.method).toBe('GET');
    req.flush(items);
  });

  it('getPullRequests() makes GET to /azure/prs', () => {
    const prs: AzurePullRequest[] = [{ id: 10, title: 'Add feature', repo: 'repo', status: 'active', url: 'https://dev.azure.com/pr/10', createdAt: '2024-01-01' }];
    service.getPullRequests().subscribe((result) => expect(result).toEqual(prs));
    const req = httpMock.expectOne('http://localhost:3000/azure/prs');
    expect(req.request.method).toBe('GET');
    req.flush(prs);
  });

  it('getPipelines() makes GET to /azure/pipelines', () => {
    const pipelines: AzurePipeline[] = [{ id: 5, name: 'CI', status: 'completed', result: 'succeeded', url: 'https://dev.azure.com/run/5', finishedAt: '2024-01-01' }];
    service.getPipelines().subscribe((result) => expect(result).toEqual(pipelines));
    const req = httpMock.expectOne('http://localhost:3000/azure/pipelines');
    expect(req.request.method).toBe('GET');
    req.flush(pipelines);
  });

  it('getCommits() makes GET to /azure/commits', () => {
    const commits: AzureCommit[] = [{ id: 'abc123', message: 'fix: bug', author: 'Felipe', url: 'https://dev.azure.com/commit/abc', date: '2024-01-01' }];
    service.getCommits().subscribe((result) => expect(result).toEqual(commits));
    const req = httpMock.expectOne('http://localhost:3000/azure/commits');
    expect(req.request.method).toBe('GET');
    req.flush(commits);
  });
});
