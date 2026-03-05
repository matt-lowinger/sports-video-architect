export interface Highlight {
  timestamp: string;
  eventType: string;
  technicalDescription: string;
  impact: number;
  link: string;
}

export interface AnalysisResult {
  highlights: Highlight[];
  summary: string;
}

export type SportType = 'Football' | 'Squash' | 'Basketball' | 'Hockey' | 'Baseball' | 'Other';
