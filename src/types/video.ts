/**
 * Video record interface for MondoSagashi archive.
 */
export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  broadcastDate: string; // ISO format: YYYY-MM-DD
  channelName: string;
  description: string;
  tags: string[];
  memo: string; // Markdown formatted notes
}

export interface VideoArchiveData {
  videos: Video[];
}

export interface TagWithCount {
  name: string;
  count: number;
}

export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
}
