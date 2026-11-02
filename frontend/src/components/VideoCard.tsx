import React from 'react';
import { Play, ExternalLink } from 'lucide-react';
import type { Video } from '../types/video.ts';

interface VideoCardProps {
  video: Video;
  onSelectVideo?: (videoId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelectVideo }) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  const handleCardClick = () => {
    if (onSelectVideo) {
      onSelectVideo(video.videoId);
    }
  };

  const getTagColorClass = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-950/60 text-red-300 border-red-800/40';
      case 'purple':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
      case 'emerald':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      case 'blue':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/40';
      case 'amber':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'cyan':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <article
      data-testid={`video-card-${video.videoId}`}
      onClick={handleCardClick}
      className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group flex flex-col justify-between shadow-lg cursor-pointer"
    >
      {/* 썸네일 영역 */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            aria-label={`${video.title} 상세 보기 및 재생`}
            className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>
        <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-mono bg-slate-950/80 text-white rounded border border-slate-800">
          ID: {video.videoId}
        </span>
      </div>

      {/* 정보 영역: 제목, 채널명 및 태그 */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* 태그 배지 목록 */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {video.tags.map((tag) => (
                <span
                  key={tag.name}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getTagColorClass(tag.color)}`}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-white font-medium text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{video.channelName}</span>
          </p>
        </div>

        <div className="pt-3 mt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-xs text-red-400 group-hover:underline font-medium">
            상세 보기 및 시점 공유 →
          </span>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            title="YouTube 원본에서 열기"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
