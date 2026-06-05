export interface AzureSettings {
  connected: boolean;
  organization: string | null;
}

export interface AzureWorkItem {
  id: number;
  title: string;
  type: string;
  state: string;
  url: string;
}

export interface AzurePullRequest {
  id: number;
  title: string;
  repo: string;
  status: string;
  url: string;
  createdAt: string;
}

export interface AzurePipeline {
  id: number;
  name: string;
  status: string;
  result: string | null;
  url: string;
  finishedAt: string | null;
}

export interface AzureCommit {
  id: string;
  message: string;
  author: string;
  url: string;
  date: string;
}
