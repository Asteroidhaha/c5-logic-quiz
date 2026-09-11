import { useEffect, useMemo, useState } from 'react'
import { LETTERS, DIFF_STYLE, CAT_COLOR, type Question, type Letter } from '../data'
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react'

interface Props {
  title: string
  questions: Question[]
  shuffleKey: number
  onShuffle: () => void
}

/** 分类练习模式：即时判分 + 解析 */
export default function PracticeQuiz({ title, questions, shuffleKey, onShuffle }: Props) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, Letter>>({})

  useEffect(() => {
    setIdx(0)
    setPicked({})
  }, [title, shuffleKey])

  const q = questions[idx]
  const done = Object.keys(picked).length
  const correct = questions.filter(x => picked[x.id] === x.answer).length
  const progress = useMemo(() => (questions.length ? Math.round((done / questions.length) * 100) : 0), [done, questions.length])

  if (!q) return <div className="p-10 text-slate-500">该分类下暂无题目</div>

  const chosen = picked[q.id]
  const answered = chosen !== undefined

  const optCls = (L: Letter) => {
    if (!answered) return 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
    if (L === q.answer) return 'border-emerald-500 bg-emerald-50'
    if (L === chosen) return 'border-rose-400 bg-rose-50'
    return 'border-slate-200 opacity-60'
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* 进度条 */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>
          第 <b className="text-slate-800">{idx + 1}</b> / {questions.length} 题 · 已作答 {done} · 答对{' '}
          <b className="text-emerald-600">{correct}</b>
        </span>
        <button onClick={onShuffle} className="text-blue-600 hover:underline text-xs">打乱题目顺序</button>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* 题卡 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[q.cat]}`}>{q.cat}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{q.sub}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFF_STYLE[q.diff]}`}>{q.diff}</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 leading-relaxed">{q.stem}</h2>
        </div>

        <div className="px-6 py-4 space-y-2.5">
          {LETTERS.map(L => (
            <button
              key={L}
              disabled={answered}
              onClick={() => setPicked(p => ({ ...p, [q.id]: L }))}
              className={`w-full flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${optCls(L)}`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  answered && L === q.answer
                    ? 'bg-emerald-500 text-white'
                    : answered && L === chosen
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {L}
              </span>
              <span className="text-[15px] text-slate-700 leading-relaxed">{q.options[L]}</span>
              {answered && L === q.answer && <CheckCircle2 size={18} className="ml-auto shrink-0 text-emerald-500 mt-0.5" />}
              {answered && L === chosen && L !== q.answer && <XCircle size={18} className="ml-auto shrink-0 text-rose-500 mt-0.5" />}
            </button>
          ))}
        </div>

        {answered && (
          <div className="mx-6 mb-5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold mb-1">
              <Lightbulb size={13} /> 解析 · 正确答案 {q.answer}
            </div>
            <p className="text-sm text-amber-900/90 leading-relaxed">{q.exp}</p>
          </div>
        )}
      </div>

      {/* 导航 */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        >
          <ArrowLeft size={15} /> 上一题
        </button>
        <button
          onClick={() => setIdx(i => Math.min(questions.length - 1, i + 1))}
          disabled={idx === questions.length - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-40"
        >
          下一题 <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
