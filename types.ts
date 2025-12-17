export interface PassportImage {
  original: string | null;
  processed: string | null;
  loading: boolean;
  error: string | null;
}
export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  CROPPING = 'CROPPING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
export interface GuidelineMetric {
  label: string;
  requirement: string;
  met: boolean;
}