import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  videoId?: string;
  onNavigateHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({
  videoId,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mb-2">
        존재하지 않거나 삭제된 영상입니다
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mb-6 font-mono leading-relaxed">
        요청하신 영상 식별자{videoId ? ` [ ${videoId} ] ` : ' '}에 해당하는 VOD 아카이브 레코드를 찾을 수 없습니다.
      </p>
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-100 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>아카이브 메인 목록으로 이동</span>
      </button>
    </div>
  );
};
