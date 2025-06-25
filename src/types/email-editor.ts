export interface SavedTemplate {
  id: string;
  name: string;
  design: Record<string, unknown>;
  createdAt: string;
  thumbnail?: string;
  base64Images?: Record<string, string>;
}

export interface MergeTag {
  name: string;
  value: string;
  sample?: string;
}

export interface UnlayerFile {
  attachments?: File[];
}

export interface UnlayerCallback {
  (file: UnlayerFile, done: (result: { progress: number; url: string }) => void): void;
}

export interface UnlayerSelectCallback {
  (data: { url: string }, done: (result: { url: string }) => void): void;
}

export interface UnlayerAPI {
  registerCallback(type: 'image', callback: UnlayerCallback): void;
  registerCallback(type: 'selectImage', callback: UnlayerSelectCallback): void;
}

declare global {
  interface Window {
    unlayer?: UnlayerAPI;
  }
} 