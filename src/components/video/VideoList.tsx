import React from 'react';
import { Video } from '../../types/video';
import { VideoCard } from './VideoCard';
import { EmptyState } from '../common/EmptyState';

interface VideoListProps {
  videos: Video[];
  searchQuery: string;
  selectedTags: string[];
  onSelectVideo: (videoId: string) => void;
  onTagClick: (tag: string) => void;
  onResetFilters: () => void;
}

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  searchQuery,
  selectedTags,
  onSelectVideo,
  onTagClick,
  onResetFilters,
}) => {
  if (videos.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        selectedTags={selectedTags}
        onReset={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onSelectVideo={onSelectVideo}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};
