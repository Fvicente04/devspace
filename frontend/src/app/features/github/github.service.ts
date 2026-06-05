// HTTP service for GitHub integration — proxies calls through the backend
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../core/environment.token';
import { PullRequest, Issue, ActivityEvent } from './github.models';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  getPullRequests(): Observable<PullRequest[]> {
    return this.http.get<PullRequest[]>(`${this.env.apiUrl}/github/prs`);
  }

  getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.env.apiUrl}/github/issues`);
  }

  getActivity(): Observable<ActivityEvent[]> {
    return this.http.get<ActivityEvent[]>(`${this.env.apiUrl}/github/activity`);
  }
}
