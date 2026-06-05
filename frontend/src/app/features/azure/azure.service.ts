import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ENVIRONMENT } from '../../core/environment.token';
import { AzureWorkItem, AzurePullRequest, AzurePipeline, AzureCommit } from './azure.models';

@Injectable({ providedIn: 'root' })
export class AzureService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  getWorkItems(): Observable<AzureWorkItem[]> {
    return this.http.get<AzureWorkItem[]>(`${this.env.apiUrl}/azure/workitems`);
  }

  getPullRequests(): Observable<AzurePullRequest[]> {
    return this.http.get<AzurePullRequest[]>(`${this.env.apiUrl}/azure/prs`);
  }

  getPipelines(): Observable<AzurePipeline[]> {
    return this.http.get<AzurePipeline[]>(`${this.env.apiUrl}/azure/pipelines`);
  }

  getCommits(): Observable<AzureCommit[]> {
    return this.http.get<AzureCommit[]>(`${this.env.apiUrl}/azure/commits`);
  }
}
