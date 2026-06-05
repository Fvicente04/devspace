// Shared interfaces for GitHub integration data — matches backend formatted output
export interface PullRequest {
  id: number;
  title: string;
  url: string;
  repo: string;
  status: 'open' | 'review';
  createdAt: string;
}

export interface Issue {
  id: number;
  title: string;
  url: string;
  repo: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'push' | 'pr' | 'issue' | 'other';
  repo: string;
  description: string;
  createdAt: string;
}
