
export type StimSetting = 'A' | 'B' | 'C' | 'Unknown';

export interface AssessmentTask {
  id: string;
  type: string;
  title: string;
  instruction: string;
  prompt: string;
  icon: string;
  significance: string;
  durationSeconds: number;
  wordPool?: string[];
  sentencePool?: string[];
}

export interface RecordingResult {
  id: string;
  timestamp: Date;
  setting: StimSetting;
  taskTitle: string;
  audioBlob?: Blob;
  duration?: number;
  deviceId?: string;
}

export interface User {
  name: string;
  patientId: string;
}
