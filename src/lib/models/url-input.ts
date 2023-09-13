export interface UrlInputChange {
  url: string;
  scheme: Scheme;
  host: string;
  hostValid: boolean;
}

export type Scheme = 'https:' | 'http:';
