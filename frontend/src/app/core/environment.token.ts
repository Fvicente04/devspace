// InjectionToken for the environment config — enables mocking in tests
import { InjectionToken } from '@angular/core';

export interface AppEnvironment {
  apiUrl: string;
  production: boolean;
  githubClientId: string;
}

export const ENVIRONMENT = new InjectionToken<AppEnvironment>('environment');
