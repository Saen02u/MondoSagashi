import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { fetchVideoDetail } from '../api/videoApi.ts';
import { TimestampNoteSection } from '../components/TimestampNoteSection.tsx';
import type { VideoDetail } from '../types/video.ts';

interface VideoDetailPageProps {
  videoId: string;
  initialTimestampSeconds?: number;
  isAdmin?: boolean;
  onOpenLoginModal?: () => void;
  onBack: () => void;
}

export const VideoDetailPage: React.FC<VideoDetailPageProps> = ({
  videoId,
  initialTimestampSeconds = 0,
  isAdmin = false,
  onOpenLoginModal = () => {},
  onBack,
}) => {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 시점 공유 및 플레이어 재생 시점 (초 단위)
  const [currentSeconds, setCurrentSeconds] = useState<number>(initialTimestampSeconds);
  const [playerStartSeconds, setPlayerStartSeconds] = useState<number>(initialTimestampSeconds);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchVideoDetail(videoId)
      .then((data) => {
        if (isMounted) {
          setVideo(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError((err as Error).message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  // 초(seconds)를 mm:ss 또는 hh:mm:ss 형식으로 변환
  const formatSeconds = (totalSec: number): string => {
    const sec = Math.max(0, Math.floor(totalSec));
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 시점 공유 URL 생성 (서비스 내부)
  const generateShareUrl = (seconds: number): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?videoId=${videoId}&t=${seconds}`;
  };

  // YouTube 공식 공유 URL 생성
  const generateYouTubeShareUrl = (seconds: number): string => {
    return `https://youtu.be/${videoId}?t=${seconds}s`;
  };

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSeekPlayer = (sec: number) => {
    setCurrentSeconds(sec);
    setPlayerStartSeconds(sec);
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" data-testid="detail-loading-state">
        <div className="h-10 bg-slate-800 rounded-xl w-48" />
        <div className="aspect-video bg-slate-900 rounded-3xl w-full border border-slate-800" />
        <div className="h-6 bg-slate-800 rounded w-2/3" />
        <div className="h-4 bg-slate-800/60 rounded w-1/3" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="p-8 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-center space-y-4">
        <h3 className="text-lg font-bold text-amber-200">영상을 불러올 수 없습니다</h3>
        <p className="text-sm text-slate-300">{error || '영상 정보가 존재하지 않습니다.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>영상 목록으로 돌아가기</span>
        </button>
      </div>
    );
  }

  const embedSrc = `${video.embedUrl}?start=${playerStartSeconds}&autoplay=1`;

  return (
    <div className="space-y-8" data-testid="video-detail-page">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>영상 목록으로 돌아가기</span>
        </button>

        <a
          href={video.youtubeWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-700/40 transition-colors text-xs font-medium"
        >
          <span>YouTube 원본 시청</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 임베드 플레이어 영역 */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            key={embedSrc}
            src={embedSrc}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* 영상 메타데이터 및 시점 공유 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측: 영상 상세 정보 및 타임스탬프 시점 메모 섹션 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            {/* 태그 목록 */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${getTagColorClass(tag.color)}`}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {video.title}
            </h1>

            {/* 채널 정보 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-red-500/40">
                  <img
                    src={video.channelThumbnailUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80'}
                    alt={video.channelName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                    <span>{video.channelName}</span>
                    <span className="text-xs text-red-400 font-normal">{video.channelCustomUrl}</span>
                  </h3>
                  <p className="text-xs text-slate-400">YouTube 라이브 다시보기 아카이브</p>
                </div>
              </div>
            </div>

            {/* 영상 설명 */}
            {video.description && (
              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50">
                {video.description}
              </div>
            )}
          </div>

          {/* 타임스탬프 시점 메모 섹션 (일반 사용자 조회 / 관리자 CRUD) */}
          <TimestampNoteSection
            videoId={videoId}
            isAdmin={isAdmin}
            currentVideoTime={currentSeconds}
            onSeek={handleSeekPlayer}
            onOpenLoginModal={onOpenLoginModal}
          />
        </div>

        {/* 우측: 시점 공유 (t 파라미터) 패널 */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-400" />
              <h3 className="text-white font-bold text-base">시점 공유 (t 파라미터)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              특정 재생 시점(초 단위)을 지정하여 해당 위치에서 재생을 시작하는 URL을 생성하고 공유할 수 있습니다.
            </p>

            {/* 시점 입력 및 미리보기 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                재생 시점 설정 (초 단위: {currentSeconds}초 = {formatSeconds(currentSeconds)})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={currentSeconds}
                  onChange={(e) => setCurrentSeconds(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="예: 90"
                />
                <button
                  type="button"
                  onClick={() => handleSeekPlayer(currentSeconds)}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-red-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>이동</span>
                </button>
              </div>
            </div>

            {/* 퀵 프리셋 버튼 */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">빠른 시점 프리셋:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '0초 (처음)', sec: 0 },
                  { label: '1분 (60s)', sec: 60 },
                  { label: '3분 (180s)', sec: 180 },
                  { label: '5분 (300s)', sec: 300 },
                  { label: '10분 (600s)', sec: 600 },
                ].map((preset) => (
                  <button
                    key={preset.sec}
                    type="button"
                    onClick={() => handleSeekPlayer(preset.sec)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                      currentSeconds === preset.sec
                        ? 'bg-red-950 text-red-300 border-red-700 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 공유 링크 복사 버튼들 */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              {/* 서비스 내부 시점 링크 */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  서비스 시점 링크 (?videoId={videoId}&t={currentSeconds})
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generateShareUrl(currentSeconds), 'app')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
                >
                  <span className="truncate max-w-[200px]">{generateShareUrl(currentSeconds)}</span>
                  {copiedLink === 'app' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-sans font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>복사됨!</span>
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* YouTube 공식 시점 링크 */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  YouTube 공식 공유 (youtu.be/?t={currentSeconds}s)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generateYouTubeShareUrl(currentSeconds), 'yt')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
                >
                  <span className="truncate max-w-[200px]">{generateYouTubeShareUrl(currentSeconds)}</span>
                  {copiedLink === 'yt' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-sans font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>복사됨!</span>
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
