export interface ProcessedImage {
  id: string;
  originalName: string;
  dataUrl: string;
  sizeBytes: number;
}

export interface DrawResult {
  card1: ProcessedImage;
  card2: ProcessedImage;
}

export interface GeminiResponse {
  text: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  READY = 'READY',
  DRAWING = 'DRAWING',
  REVEALED = 'REVEALED',
}