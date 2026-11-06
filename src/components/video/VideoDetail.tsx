import React from 'react';
import { Video } from '../../types/video';
import { MarkdownRenderer } from '../../lib/markdown';
import { ArrowLeft, ExternalLink, Calendar, Tv, Tag, Copy, Check } from 'lucide-react';

interface VideoDetailProps {
  video: Video;
  onNavigateHome: () => void;
  onSelectTag?: (tag: string) => void;
}

export const VideoDetail: React.FC<VideoDetailProps> = ({
  video,
  onNavigateHome,
  onSelectTag,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Top Navigation Strip */}
      <nav className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors py-1.5 px-2.5 -ml-2.5 rounded hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>아카이브 전체 목록</span>
        </button>

        <button
          onClick={handleCopyLink}
          type="button"
          title="아카이브 링크 복사"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">링크 복사됨</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>공유 링크</span>
            </>
          )}
        </button>
      </nav>

      {/* Header Info Block */}
      <header className="mb-8 pb-8 border-b border-slate-800">
        {/* Unboxed Metadata with Typographic Middots */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono text-slate-400 mb-3">
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
            <Tv className="w-3.5 h-3.5" />
            {video.channelName}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 opacity-80" />
            <time dateTime={video.broadcastDate}>{video.broadcastDate}</time>
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-500 font-mono">ID: {video.id}</span>
        </div>

        {/* Video Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight leading-snug mb-4">
          {video.title}
        </h1>

        {/* Description Excerpt */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-6">
          {video.description}
        </p>

        {/* Tags and Direct Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Tags */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
              <Tag className="w-3 h-3" />
              태그:
            </span>
            {video.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag?.(tag)}
                className="text-xs font-mono text-amber-400/90 hover:text-amber-300 hover:underline transition-colors mr-1.5"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* YouTube Primary Outbound CTA */}
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 transition-colors rounded-lg shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>YouTube 원본 영상 열기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Markdown Memo Section */}
      <section aria-label="방송 마크다운 기록" className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            방송 아카이브 메모 (Read-Only)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Markdown Document
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121a] p-6 sm:p-8 shadow-sm">
          <MarkdownRenderer content={video.memo} />
        </div>
      </section>

      {/* Bottom Back Button */}
      <div className="mt-12 pt-6 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 font-medium text-slate-300 hover:text-amber-400 transition-colors py-2 px-3 rounded hover:bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>영상 목록으로 돌아가기</span>
        </button>
        <span className="font-mono text-slate-500">MondoSagashi Archive</span>
      </div>
    </article>
  );
};
