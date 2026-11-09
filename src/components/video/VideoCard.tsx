import React from 'react';
import { Video } from '../../types/video';
import { Calendar, Tv, Clock, ExternalLink, FileText, ChevronRight } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onSelectVideo: (videoId: string) => void;
  onTagClick?: (tag: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  onTagClick,
}) => {
  return (
    <article className="group relative rounded-xl border border-slate-800/80 bg-[#10151d] hover:border-slate-700 hover:bg-[#131923] p-5 sm:p-6 transition-all duration-200 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Metadata Strip: Channel & Date (Zero-pill discipline with middot) */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 font-mono mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Tv className="w-3.5 h-3.5 opacity-80" />
            {video.channelName}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <time dateTime={video.broadcastDate}>{video.broadcastDate}</time>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            {video.duration}
          </span>
        </div>

        {/* Video Title: Clickable link to detail */}
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug tracking-tight mb-2.5">
          <button
            onClick={() => onSelectVideo(video.id)}
            className="text-left w-full focus-visible:outline-none focus-visible:underline decoration-amber-400 underline-offset-4"
          >
            {video.title}
          </button>
        </h2>

        {/* Video Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {video.description}
        </p>

        {/* Tags Metadata */}
        <div className="flex items-center flex-wrap gap-1.5 mb-5">
          {video.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-amber-300 hover:underline transition-colors mr-2 last:mr-0"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer: Details view button + External YouTube link */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <button
          onClick={() => onSelectVideo(video.id)}
          className="inline-flex items-center gap-1.5 font-medium text-amber-400 hover:text-amber-300 transition-colors focus-visible:outline-none"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>방송 메모 읽기</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="새 탭에서 원본 YouTube 영상 열기"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded hover:bg-slate-800/60"
        >
          <span>YouTube 원본</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>
    </article>
  );
};
