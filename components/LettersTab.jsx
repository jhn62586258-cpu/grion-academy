'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import {
  addComment,
  adminDeleteComment,
  adminDeleteLetter,
  isAdminUser,
  postLetter,
  subscribeComments,
  subscribeLetters,
  toggleHeart,
} from '@/lib/db';
import { getDeviceId, timeAgo } from '@/lib/grade';
import Grion from './Grion';

export default function LettersTab() {
  const { user, toast, rankIndex } = useApp();
  const [letters, setLetters] = useState([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const isAdmin = isAdminUser(user);

  useEffect(() => {
    setDeviceId(getDeviceId());
    return subscribeLetters(setLetters, (e) => console.error(e));
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (text.trim().length < 2 || posting) return;
    setPosting(true);
    try {
      await postLetter(text);
      setText('');
      toast('💌 익명으로 편지를 보냈어요');
    } catch (err) {
      console.error(err);
      toast('전송에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="px-4 pt-3">
      {/* 안내 + 작성 */}
      <div className="card-3d p-4">
        <div className="flex items-center gap-3">
          <Grion rank={rankIndex} size={72} anim="float" className="shrink-0" />
          <p className="text-sm font-bold leading-relaxed text-forest">
            교사를 하면서의 어려움, 신앙생활의 기쁨, 말씀의 나눔 등 마음속 이야기를{' '}
            <span className="text-grion-600">익명</span>으로 나눠요. 서로 하트와 응원 댓글로 힘이 되어 주세요!
          </p>
        </div>
        <form onSubmit={submit} className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="마음속 이야기를 편하게 적어 주세요. (욕설·비방 등은 자동 삭제됩니다.)"
            className="w-full resize-none rounded-2xl border-[3px] border-grion-200 bg-grion-50 p-3 text-[0.95rem] font-medium leading-relaxed text-forest outline-none placeholder:text-gray-400 focus:border-grion-500"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
              <ShieldCheck size={15} /> 작성자 정보는 저장되지 않아요 · {text.length}/500
            </span>
            <button type="submit" disabled={text.trim().length < 2 || posting} className="btn-3d btn-green !px-4 !py-2 text-lg">
              <Send size={18} strokeWidth={2.8} /> {posting ? '전송 중' : '보내기'}
            </button>
          </div>
        </form>
      </div>

      {/* 목록 */}
      <ul className="mt-5 space-y-4">
        {letters.length === 0 && (
          <li className="rounded-2xl bg-white/70 p-6 text-center font-bold text-gray-500">
            아직 도착한 편지가 없어요. 첫 번째 이야기를 남겨 보세요!
          </li>
        )}
        {letters.map((l) => (
          <LetterCard key={l.id} letter={l} deviceId={deviceId} isAdmin={isAdmin} toast={toast} />
        ))}
      </ul>
    </div>
  );
}

function LetterCard({ letter, deviceId, isAdmin, toast }) {
  const [open, setOpen] = useState(false);
  const hearted = useMemo(() => (letter.heartedBy || []).includes(deviceId), [letter.heartedBy, deviceId]);

  async function heart() {
    if (!deviceId) return;
    try {
      await toggleHeart(letter.id, deviceId, hearted);
    } catch {
      toast('공감을 전하지 못했어요.');
    }
  }

  async function removeLetter() {
    if (!window.confirm('이 편지와 달린 댓글을 모두 삭제할까요?')) return;
    try {
      await adminDeleteLetter(letter.id);
      toast('🗑️ 편지를 삭제했습니다.');
    } catch {
      toast('삭제에 실패했습니다.');
    }
  }

  return (
    <li className="card-3d p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="whitespace-pre-wrap break-words text-[0.97rem] font-medium leading-relaxed text-forest flex-1">
          {letter.text}
        </p>
        {isAdmin && (
          <button
            onClick={removeLetter}
            className="shrink-0 rounded-xl bg-red-50 p-1.5 text-red-500 active:scale-90"
            aria-label="편지 삭제"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">익명 교사 · {timeAgo(letter.createdAt)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={heart}
            className={`flex items-center gap-1 rounded-full border-2 px-3 py-1 font-display text-base transition active:scale-90 ${
              hearted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-500'
            }`}
            aria-pressed={hearted}
          >
            <Heart size={18} fill={hearted ? 'currentColor' : 'none'} strokeWidth={2.6} /> {Math.max(0, letter.hearts || 0)}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`flex items-center gap-1 rounded-full border-2 px-3 py-1 font-display text-base active:scale-90 ${
              open ? 'border-grion-400 bg-grion-50 text-grion-700' : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <MessageCircle size={18} strokeWidth={2.6} /> {letter.commentCount || 0}
          </button>
        </div>
      </div>
      {open && <Comments letterId={letter.id} isAdmin={isAdmin} toast={toast} />}
    </li>
  );
}

function Comments({ letterId, isAdmin, toast }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeComments(letterId, setComments, (e) => console.error(e)), [letterId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await addComment(letterId, text);
      setText('');
    } catch {
      toast('댓글을 남기지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId) {
    if (!window.confirm('이 댓글을 삭제할까요?')) return;
    try {
      await adminDeleteComment(letterId, commentId);
      toast('🗑️ 댓글을 삭제했습니다.');
    } catch {
      toast('댓글 삭제에 실패했습니다.');
    }
  }

  return (
    <div className="mt-3 animate-fadeIn border-t-2 border-dashed border-grion-100 pt-3">
      <ul className="space-y-2">
        {comments.length === 0 && <li className="text-xs font-bold text-gray-400">첫 응원 댓글을 남겨 주세요 💚</li>}
        {comments.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-2 rounded-2xl rounded-tl-sm bg-grion-50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-wrap break-words text-sm font-medium leading-snug text-forest">{c.text}</p>
              <p className="mt-0.5 text-[0.7rem] font-bold text-gray-400">익명 · {timeAgo(c.createdAt)}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => removeComment(c.id)}
                className="shrink-0 rounded-lg bg-red-50 p-1 text-red-500 active:scale-90"
                aria-label="댓글 삭제"
              >
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder="응원의 한마디 (충진!)"
          className="min-w-0 flex-1 rounded-full border-[3px] border-grion-200 bg-white px-4 py-2 text-sm font-medium text-forest outline-none focus:border-grion-500"
        />
        <button type="submit" disabled={!text.trim() || busy} className="btn-3d btn-green !rounded-full !px-4 !py-2" aria-label="댓글 보내기">
          <Send size={18} strokeWidth={2.8} />
        </button>
      </form>
    </div>
  );
}
