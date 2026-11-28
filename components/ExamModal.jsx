'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, RotateCcw, Send, X } from 'lucide-react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAdminUser } from '@/lib/db';
import { useApp } from '@/lib/AppContext';
import { EXAM_STAGES } from '@/data/examData';

export default function ExamModal({ open, onClose }) {
  const { user, session, toast } = useApp();
  const [stageIdx, setStageIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [records, setRecords] = useState([]);

  const isAdmin = isAdminUser(user);
  const stage = EXAM_STAGES[stageIdx];

  useEffect(() => {
    if (!open || !isAdmin) return;
    const q = query(collection(db, 'exam_submissions'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [open, isAdmin]);

  if (!open) return null;

  function setVal(key, val) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy || stage.questions.length === 0) return;
    setBusy(true);
    try {
      await addDoc(collection(db, 'exam_submissions'), {
        classId: session?.classId || '',
        nickname: user?.nickname || session?.nickname || '',
        stageId: stage.id,
        stageTitle: stage.title,
        answers,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      toast('답안이 제출되었습니다! 모범 답안을 확인해 보세요.');
    } catch (err) {
      console.error(err);
      toast('제출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setAnswers({});
    setSubmitted(false);
  }

  function downloadCsv() {
    if (records.length === 0) {
      toast('아직 제출된 답안이 없습니다.');
      return;
    }
    const rows = [['제출일시', '소속반', '닉네임', '단계', '문항번호', '작성답안']];
    records.forEach((r) => {
      const dt = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('ko-KR') : '';
      Object.entries(r.answers || {}).forEach(([k, v]) => {
        rows.push([dt, r.classId, r.nickname, r.stageTitle, k, String(v).replace(/\n/g, ' ')]);
      });
    });
    const csv = '\uFEFF' + rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `천제고_제출답안_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col bg-[#f4fbec]">
      <div className="flex items-center justify-between border-b-2 border-grion-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-forest">천국 제사장 고사 (시험공부)</h2>
          <p className="text-xs text-grion-700">직접 답을 적고 제출하면 모범 답안을 확인할 수 있어요</p>
        </div>
        <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-600 active:scale-95">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 bg-white px-3 py-2 border-b border-grion-100">
        {EXAM_STAGES.map((st, idx) => (
          <button
            key={st.id}
            onClick={() => {
              setStageIdx(idx);
              setAnswers({});
              setSubmitted(false);
            }}
            className={`rounded-xl py-2 text-sm font-bold transition ${
              stageIdx === idx ? 'bg-grion-500 text-white shadow' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {st.title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isAdmin && (
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-amber-700 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">제출 답안 취합 ({records.length}건)</p>
                  <p className="text-[11px] text-amber-700">CSV 다운로드 후 구글 시트/엑셀에서 열 수 있어요</p>
                </div>
              </div>
              <button onClick={downloadCsv} className="btn-3d btn-yellow !px-3 !py-1.5 text-xs shrink-0">
                <Download size={14} /> 시트 다운
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-3.5 border-2 border-grion-200">
          <p className="text-base font-bold text-forest">{stage.subtitle}</p>
        </div>

        {stage.questions.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200">
            아직 문제가 등록되지 않은 단계입니다.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pb-8">
            {stage.questions.map((q) => (
              <div key={q.id} className="card-3d p-4 space-y-2.5">
                <span className="inline-block rounded-full bg-grion-100 px-2.5 py-0.5 text-xs font-bold text-grion-800">
                  {q.category}
                </span>
                <p className="text-base font-bold leading-relaxed text-forest whitespace-pre-line">{q.prompt}</p>

                {q.type === 'short' ? (
                  <div>
                    <input
                      value={answers[q.id] || ''}
                      onChange={(e) => setVal(q.id, e.target.value)}
                      disabled={submitted}
                      placeholder="정답을 직접 적어주세요"
                      className="w-full rounded-xl border-2 border-grion-300 bg-grion-50/50 px-3 py-2 text-sm text-forest outline-none focus:border-grion-500"
                    />
                    {submitted && (
                      <div className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
                        <span className="font-bold text-grion-700">[모범 답안]</span> {q.answer}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {q.blanks.map((ans, bIdx) => {
                      const key = `${q.id}_${bIdx + 1}`;
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-grion-700 shrink-0">빈칸 {bIdx + 1}</span>
                            <input
                              value={answers[key] || ''}
                              onChange={(e) => setVal(key, e.target.value)}
                              disabled={submitted}
                              placeholder={`빈칸 ${bIdx + 1} 정답 입력`}
                              className="min-w-0 flex-1 rounded-xl border-2 border-grion-300 bg-grion-50/50 px-3 py-1.5 text-sm text-forest outline-none focus:border-grion-500"
                            />
                          </div>
                          {submitted && (
                            <p className="mt-1 pl-11 text-xs font-bold text-amber-800">모범 답안: {ans}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {!submitted ? (
              <button type="submit" disabled={busy} className="btn-3d btn-green w-full text-lg">
                <Send size={18} /> {busy ? '제출 중...' : '답안 제출 및 정답 확인'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-grion-100 p-3 text-sm font-bold text-grion-800">
                  <CheckCircle2 size={18} /> 제출 완료! 위 모범 답안과 비교해 보세요.
                </div>
                <button type="button" onClick={resetForm} className="btn-3d btn-white w-full text-base">
                  <RotateCcw size={16} /> 다시 풀어보기
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
