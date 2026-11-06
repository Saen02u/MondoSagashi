import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-900 bg-[#070a0e] py-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-slate-400">MondoSagashi Archive</span>
          <span className="hidden sm:inline text-slate-700">·</span>
          <span>정적 텍스트 기반 YouTube 다시보기 보관소</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Serverless & Static Export Ready</span>
          <span className="text-slate-700">·</span>
          <span>Zero Embed · Zero Tracking</span>
        </div>
      </div>
    </footer>
  );
};
