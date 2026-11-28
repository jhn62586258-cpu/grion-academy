'use client';

export default function LessonNote({ lesson }) {
  const pairs = lesson?.rounds?.match?.pairs || [];
  return (
    <div className="mb-4 max-h-60 space-y-2.5 overflow-y-auto rounded-2xl border-2 border-grion-200 bg-grion-50/70 p-3.5">
      <div className="text-xs font-bold text-grion-700">[훈련 전 핵심 말씀 및 주제 예습]</div>
      {lesson?.summary ? (
        <div className="rounded-xl bg-white p-2.5 text-sm leading-relaxed text-forest shadow-sm">
          {lesson.summary}
        </div>
      ) : null}
      {pairs.map((pair, idx) => (
        <div key={idx} className="rounded-xl bg-white p-2.5 text-xs shadow-sm">
          <div className="font-bold text-grion-700">- {pair.verse}</div>
          <div className="mt-0.5 text-forest">{pair.theme}</div>
        </div>
      ))}
    </div>
  );
}
