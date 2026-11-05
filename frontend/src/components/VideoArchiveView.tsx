import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Play, Database, Youtube, CheckCircle2 } from 'lucide-react';
import { getVideos } from '../api/video.ts';
import type { VideoResponse } from '../types/index.ts';

export const VideoArchiveView: React.FC = () => {
  // Mondo (@Mondo2233) 전용 기본 데이터 (PostgreSQL 초기화 데이터와 일치)
  const [videos, setVideos] = useState<VideoResponse[]>([
    {
      videoId: '2yK2D41LzB8',
      title: '[Mondo] 에이펙스 레전드 솔로 마스터 랭크 챌린지 풀버전 다시보기',
      channelName: 'Mondo',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&auto=format&fit=crop&q=80',
    },
    {
      videoId: '8jTqN31pW9k',
      title: '[Mondo] 치지직 & 유튜브 동시 송출 라이브 다시보기 - 토크 및 게임 플레이',
      channelName: 'Mondo',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&auto=format&fit=crop&q=80',
    },
    {
      videoId: '6zVpM91kL3q',
      title: '[Mondo] 시청자 참여 커스텀 매치 & 심야 수다 라이브 스트리밍 다시보기',
      channelName: 'Mondo',
      thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&auto=format&fit=crop&q=80',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isDbData, setIsDbData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackendVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVideos();
      setVideos(data.content);
      setIsDbData(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mondo Dedicated Channel Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80"
                  alt="Mondo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                <Youtube className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">Mondo (@Mondo2233)</h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-900/60 text-red-300 border border-red-700/50">
                  전용 아카이브
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Apex Legends 및 종합 게임 스트리머 Mondo의 라이브 방송 다시보기를 모아서 제공합니다.
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <a
                  href="https://www.youtube.com/@Mondo2233"
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors font-medium"
                >
                  <span>https://www.youtube.com/@Mondo2233</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                DB: PostgreSQL / JPA
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-emerald-950 border border-emerald-800/40 text-emerald-400">
                UNIQUE(youtube_video_id)
              </span>
            </div>
            <button
              onClick={fetchBackendVideos}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>DB 실시간 조회 (GET /api/v1/videos)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid from DB */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="text-white font-bold text-base">보관된 라이브 다시보기 영상 목록</h4>
            {isDbData && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium ml-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Spring Data JPA 실시간 조회 데이터
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">총 {videos.length}개의 영상</span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200">
            <p className="font-semibold mb-1">안내: 로컬 백엔드 서버 연결</p>
            <p className="text-slate-300">
              백엔드 서버와 PostgreSQL이 구동 중일 때 실시간으로 통신합니다:
              <code className="text-amber-300 ml-1 font-mono">cd backend && ./mvnw spring-boot:run</code>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.videoId}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </a>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-mono bg-slate-950/80 text-white rounded">
                  ID: {video.videoId}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h5 className="text-white font-medium text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h5>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {video.channelName} (@Mondo2233)
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-slate-500">VideoResponse DTO</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <span>YouTube 재생</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
