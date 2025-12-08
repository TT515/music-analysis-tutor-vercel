export interface AudioUploaderProps {
  onFileUpload: (file: File | null) => void;
  file: File | null;
}

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export interface ChatDisplayProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}
