import { useEffect, useMemo, useState } from 'react'
import { LETTERS, DIFF_STYLE, CAT_COLOR, type Question, type Letter } from '../data'
import { markResult, useRecords, type Records } from '../store'
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Lightbulb, History } from 'lucide-react'
import SpeakButton, { questionToSpeech } from './SpeakButton'

interface Props {
  title: string
  questions: Question[]
  shuffleKey: number
  onShuffle: () => void
  isWrongBook?: boolean
}

/** 分类练习模式：即时判分 + 解析 + 持久化答题记录 */
export default function PracticeQuiz({ title, questions, shuffleKey, onShuffle, isWrongBook }: Props) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<number, Letter>>({})
  const records = useRecords()

  useEffect(() => {
    setIdx(0)
    setPicked({})
  }, [title, shuffleKey])

  // 错题本中答对后题目会移出列表，防止越界
  useEffect(() => {
    if (idx > questions.length - 1) setIdx(Math.max(0, questions.length - 1))
  }, [questions.length, idx])

  const q = questions[idx]
  const done = Object.keys(picked).length
  const correct = questions.filter(x => picked[x.id] === x.answer).length
  const progress = useMemo(() => (questions.length ? Math.round((done / questions.length) * 100) : 0), [done, questions.length])

  if (!q) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-3" />
        <div className="text-lg font-bold text-slate-700">{isWrongBook ? '错题全部清零，太棒了！' : '该分类下暂无题目'}</div>
        {isWrongBook && <div className="mt-1 text-sm text-slate-400">去其他分类继续练习吧</div>}
      </div>
    )
  }

  const chosen = picked[q.id]
  const answered = chosen !== undefined
  const rec = records[q.id]

  function choose(L: Letter) {
    if (answered) return
    setPicked(p => ({ ...p, [q.id]: L }))
    markResult(q.id, L === q.answer)
  }

  const optCls = (L: Letter) => {
    if (!answered) return 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
    if (L === q.answer) return 'border-emerald-500 bg-emerald-50'
    if (L === chosen) return 'border-rose-400 bg-rose-50'
    return 'border-slate-200 opacity-60'
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* 进度条 */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>
          第 <b className="text-slate-800">{idx + 1}</b> / {questions.length} 题 · 本次作答 {done} · 答对{' '}
          <b className="text-emerald-600">{correct}</b>
        </span>
        <button onClick={onShuffle} className="text-blue-600 hover:underline text-xs">打乱题目顺序</button>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* 题号状态条：绿=答对 红=答错 灰=未做 */}
      <StatusStrip questions={questions} records={records} idx={idx} onJump={setIdx} />

      {/* 题卡 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-3">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[q.cat]}`}>{q.cat}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{q.sub}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFF_STYLE[q.diff]}`}>{q.diff}</span>
            {rec && (
              <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                rec.last === 'right' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
              }`}>
                <History size={11} />
                做过{rec.tries}次 · 对{rec.right}次 · 上次{rec.last === 'right' ? '答对' : '答错'}
              </span>
            )}
            <SpeakButton text={questionToSpeech(q.stem, q.options, idx + 1)} className="ml-auto" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 leading-relaxed">{q.stem}</h2>
        </div>

        <div className="px-6 py-4 space-y-2.5">
          {LETTERS.map(L => (
            <button
              key={L}
              disabled={answered}
              onClick={() => choose(L)}
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

/** 题号状态条：点击跳题 */
function StatusStrip({ questions, records, idx, onJump }: { questions: Question[]; records: Records; idx: number; onJump: (i: number) => void }) {
  const COLS = 20
  const rows: Question[][] = []
  for (let i = 0; i < questions.length; i += COLS) rows.push(questions.slice(i, i + COLS))
  // 只显示当前所在行附近，最多 4 行，避免超长
  const curRow = Math.floor(idx / COLS)
  const visible = rows.slice(Math.max(0, curRow - 1), curRow + 3)

  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5">
      <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2 px-1">
        <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />答对</span>
        <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-rose-400 inline-block" />答错</span>
        <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-slate-200 inline-block" />未做</span>
        <span className="ml-auto">点击题号跳题</span>
      </div>
      <div className="space-y-1">
        {visible.map((row, ri) => {
          const rowStart = (Math.max(0, curRow - 1) + ri) * COLS
          return (
            <div key={rowStart} className="flex gap-1 flex-wrap">
              {row.map((x, i) => {
                const no = rowStart + i
                const r = records[x.id]
                const cls =
                  no === idx
                    ? 'bg-blue-600 text-white'
                    : r?.last === 'right'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : r?.last === 'wrong'
                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                return (
                  <button key={x.id} onClick={() => onJump(no)} className={`w-7 h-7 rounded text-[11px] font-bold transition-colors ${cls}`}>
                    {no + 1}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
