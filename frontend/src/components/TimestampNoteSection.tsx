import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Edit2, Check, X, Shield, Lock, AlertCircle, Play } from 'lucide-react';
import { fetchNotes, createNote, updateNote, deleteNote } from '../api/noteApi.ts';
import type { TimestampNote } from '../types/note.ts';

interface TimestampNoteSectionProps {
  videoId: string;
  isAdmin: boolean;
  currentVideoTime: number;
  onSeek: (seconds: number) => void;
  onOpenLoginModal: () => void;
}

export const TimestampNoteSection: React.FC<TimestampNoteSectionProps> = ({
  videoId,
  isAdmin,
  currentVideoTime,
  onSeek,
  onOpenLoginModal,
}) => {
  const [notes, setNotes] = useState<TimestampNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 추가 폼 상태
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addPosition, setAddPosition] = useState<number>(0);
  const [addContent, setAddContent] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // 수정 모드 상태
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editPosition, setEditPosition] = useState<number>(0);
  const [editContent, setEditContent] = useState<string>('');

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotes(videoId);
      setNotes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [videoId]);

  const handleStartAdd = () => {
    setAddPosition(currentVideoTime || 0);
    setAddContent('');
    setIsAdding(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addPosition < 0) {
      alert('재생 시점은 0초 이상이어야 합니다.');
      return;
    }
    if (!addContent.trim()) {
      alert('메모 내용을 입력해 주세요.');
      return;
    }

    setActionLoading(true);
    try {
      const newNote = await createNote(videoId, {
        positionSeconds: addPosition,
        content: addContent.trim(),
      });
      setNotes((prev) => [...prev, newNote].sort((a, b) => a.positionSeconds - b.positionSeconds));
      setIsAdding(false);
      setAddContent('');
    } catch (err) {
      alert('메모 등록 실패: ' + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEdit = (note: TimestampNote) => {
    setEditingNoteId(note.id);
    setEditPosition(note.positionSeconds);
    setEditContent(note.content);
  };

  const handleUpdateSubmit = async (e: React.FormEvent, noteId: number) => {
    e.preventDefault();
    if (editPosition < 0) {
      alert('재생 시점은 0초 이상이어야 합니다.');
      return;
    }
    if (!editContent.trim()) {
      alert('메모 내용을 입력해 주세요.');
      return;
    }

    setActionLoading(true);
    try {
      const updated = await updateNote(noteId, {
        positionSeconds: editPosition,
        content: editContent.trim(),
      });
      setNotes((prev) =>
        prev
          .map((n) => (n.id === noteId ? updated : n))
          .sort((a, b) => a.positionSeconds - b.positionSeconds)
      );
      setEditingNoteId(null);
    } catch (err) {
      alert('메모 수정 실패: ' + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!window.confirm('이 시점 메모를 삭제하시겠습니까?')) return;

    setActionLoading(true);
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      alert('메모 삭제 실패: ' + (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5" data-testid="timestamp-note-section">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-red-500" />
          <h3 className="text-white font-bold text-base">타임스탬프 시점 메모</h3>
          <span className="text-xs text-slate-400 font-mono">({notes.length})</span>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={handleStartAdd}
            disabled={isAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>메모 추가</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>관리자 로그인 후 작성</span>
          </button>
        )}
      </div>

      {/* 관리자 메모 추가 폼 */}
      {isAdmin && isAdding && (
        <form onSubmit={handleCreateSubmit} className="p-4 rounded-2xl bg-slate-950 border border-red-900/50 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              신규 시점 메모 작성
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                시점 (초 단위)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  required
                  value={addPosition}
                  onChange={(e) => setAddPosition(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setAddPosition(currentVideoTime)}
                  title="현재 플레이어 시점 복사"
                  className="shrink-0 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-mono"
                >
                  현재 시점
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                메모 내용 (최대 1000자)
              </label>
              <input
                type="text"
                required
                maxLength={1000}
                value={addContent}
                onChange={(e) => setAddContent(e.target.value)}
                placeholder="예: 윙맨 3연속 헤드샷 클러치 장면"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold disabled:opacity-50"
            >
              {actionLoading ? '저장 중...' : '메모 저장'}
            </button>
          </div>
        </form>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="space-y-2 py-2 animate-pulse">
          <div className="h-10 bg-slate-950 rounded-xl w-full" />
          <div className="h-10 bg-slate-950 rounded-xl w-full" />
        </div>
      )}

      {/* 오류 상태 */}
      {!loading && error && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>시점 메모를 불러오는 중 오류가 발생했습니다: {error}</span>
        </div>
      )}

      {/* 빈 목록 상태 */}
      {!loading && !error && notes.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">등록된 타임스탬프 시점 메모가 없습니다.</p>
          {isAdmin ? (
            <button
              type="button"
              onClick={handleStartAdd}
              className="text-xs text-red-400 hover:underline font-semibold"
            >
              + 첫 번째 시점 메모를 작성해 보세요
            </button>
          ) : (
            <p className="text-[11px] text-slate-500">
              관리자로 로그인하면 영상의 주요 장면별 메모를 기록할 수 있습니다.
            </p>
          )}
        </div>
      )}

      {/* 메모 리스트 */}
      {!loading && !error && notes.length > 0 && (
        <div className="space-y-2.5">
          {notes.map((note) => {
            const isEditing = editingNoteId === note.id;

            if (isEditing) {
              return (
                <form
                  key={note.id}
                  onSubmit={(e) => handleUpdateSubmit(e, note.id)}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-red-800/60 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      required
                      value={editPosition}
                      onChange={(e) => setEditPosition(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      required
                      maxLength={1000}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="저장"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="취소"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={note.id}
                className="group p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => onSeek(note.positionSeconds)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(note.positionSeconds);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40 text-xs font-mono font-semibold transition-colors shrink-0"
                    title={`${note.formattedTime} 시점으로 이동`}
                  >
                    <Play className="w-3 h-3 fill-red-400 text-red-400" />
                    <span>{note.formattedTime}</span>
                  </button>
                  <p className="text-xs text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                    {note.content}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(note)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="메모 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                      title="메모 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
