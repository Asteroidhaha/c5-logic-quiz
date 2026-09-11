import { useEffect, useMemo, useRef, useState } from 'react'
import { LETTERS, CAT_COLOR, DIFF_STYLE, type Question, type Letter } from '../data'
import { Timer, AlertTriangle, Trophy, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import SpeakButton, { questionToSpeech } from './SpeakButton'
import { markResult } from '../store'

const EXAM_SECONDS = 60 * 60

interface Props {
  questions: Question[]
  onExit: () => void
  onRestart: () => void
}

/** 模拟考试模式：仿真线上测评环境 —— 倒计时、答题卡、交卷判分 */
export default function ExamQuiz({ questions, onExit, onRestart }: Props) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Letter>>({})
  const [left, setLeft] = useState(EXAM_SECONDS)
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timer.current = setInterval(() => setLeft(s => s - 1), 1000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  useEffect(() => {
    if (left <= 0 && !submitted) submit()
  }, [left, submitted])

  const score = useMemo(() => questions.filter(q => answers[q.id] === q.answer).length * 5, [submitted, answers, questions])
  const answeredCount = Object.keys(answers).length
  const q = questions[idx]

  function submit() {
    if (timer.current) clearInterval(timer.current)
    // 交卷即存档：每题对错写入刷题记录（未作答记为答错）
    questions.forEach(x => markResult(x.id, answers[x.id] === x.answer))
    setSubmitted(true)
    setConfirming(false)
  }

  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, '0')
  const ss = String(Math.max(0, left % 60)).padStart(2, '0')
  const timeUrgent = left < 300 && !submitted

  /* ---------- 成绩单 ---------- */
  if (submitted) {
    const pass = score >= 60
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-8 text-center ${pass ? 'bg-gradient-to-b from-emerald-50' : 'bg-gradient-to-b from-rose-50'} to-white`}>
            <Trophy size={40} className={`mx-auto mb-3 ${pass ? 'text-amber-500' : 'text-slate-400'}`} />
            <div className="text-5xl font-black text-slate-800">
              {score}
              <span className="text-lg font-medium text-slate-400"> / 100 分</span>
            </div>
            <div className={`mt-2 text-sm font-semibold ${pass ? 'text-emerald-600' : 'text-rose-500'}`}>
              {pass ? '恭喜，已达到合格线！正式初赛为达标制晋级' : '未达合格线（60分），再练一轮吧'}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              答对 {score / 5} 题 · 答错 {20 - score / 5} 题 · 用时 {Math.floor((EXAM_SECONDS - left) / 60)} 分 {String((EXAM_SECONDS - left) % 60).padStart(2, '0')} 秒
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button onClick={onRestart} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500">
                <RotateCcw size={15} /> 再考一次（重新抽题）
              </button>
              <button onClick={onExit} className="px-5 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100">
                返回分类练习
              </button>
            </div>
          </div>

          {/* 逐题回顾 */}
          <div className="px-6 py-5 space-y-3">
            <div className="text-sm font-bold text-slate-700 mb-1">逐题回顾（点击答题卡可回看）</div>
            <div className="grid grid-cols-10 gap-1.5 mb-4">
              {questions.map((x, i) => {
                const ok = answers[x.id] === x.answer
                return (
                  <button
                    key={x.id}
                    onClick={() => setIdx(i)}
                    className={`h-8 rounded text-xs font-bold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'} ${i === idx ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <ReviewCard q={questions[idx]} no={idx + 1} picked={answers[questions[idx].id]} />
          </div>
        </div>
      </div>
    )
  }

  /* ---------- 考试中 ---------- */
  return (
    <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-[1fr_220px] gap-5">
      <div>
        {/* 考试信息条 */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5 mb-4 shadow-sm">
          <div className="text-sm text-slate-600">
            <b className="text-slate-800">C5 逻辑思维建模 · 模拟测评</b>
            <span className="ml-3 text-xs text-slate-400">单选题 · 每题 5 分 · 答错不扣分</span>
          </div>
          <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timeUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
            <Timer size={17} /> {mm}:{ss}
          </div>
        </div>

        {/* 题卡 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-slate-400">第 {idx + 1} 题 / 共 20 题</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[q.cat]}`}>{q.cat}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFF_STYLE[q.diff]}`}>{q.diff}</span>
              <SpeakButton text={questionToSpeech(q.stem, q.options, idx + 1)} className="ml-auto" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 leading-relaxed">{q.stem}</h2>
          </div>
          <div className="px-6 py-4 space-y-2.5">
            {LETTERS.map(L => {
              const active = answers[q.id] === L
              return (
                <button
                  key={L}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: L }))}
                  className={`w-full flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                    active ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {L}
                  </span>
                  <span className="text-[15px] text-slate-700 leading-relaxed">{q.options[L]}</span>
                </button>
              )
            })}
          </div>
          <div className="px-6 pb-5 flex justify-between">
            <button
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              上一题
            </button>
            <button
              onClick={() => setIdx(i => Math.min(19, i + 1))}
              disabled={idx === 19}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-40"
            >
              下一题
            </button>
          </div>
        </div>
      </div>

      {/* 答题卡 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-fit sticky top-5">
        <div className="text-sm font-bold text-slate-700 mb-1">答题卡</div>
        <div className="text-xs text-slate-400 mb-3">已答 {answeredCount} / 20</div>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setIdx(i)}
              className={`h-8 rounded text-xs font-bold transition-colors ${
                i === idx
                  ? 'bg-blue-600 text-white'
                  : answers[x.id]
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 w-full py-2.5 rounded-lg bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 transition-colors"
        >
          交 卷
        </button>
        <button onClick={onExit} className="mt-2 w-full py-2 rounded-lg text-xs text-slate-400 hover:text-slate-600">
          放弃本次测评
        </button>
      </div>

      {/* 交卷确认 */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center gap-2 text-amber-600 font-bold mb-2">
              <AlertTriangle size={18} /> 确认交卷？
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              已作答 <b>{answeredCount}</b> / 20 题。
              {answeredCount < 20 && <span className="text-rose-500">还有 {20 - answeredCount} 题未作答，未作答按答错计。</span>}
              交卷后立即出分，不能修改答案。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirming(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100">
                继续作答
              </button>
              <button onClick={submit} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-bold hover:bg-rose-500">
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewCard({ q, no, picked }: { q: Question; no: number; picked?: Letter }) {
  const ok = picked === q.answer
  return (
    <div className={`rounded-lg border-2 ${ok ? 'border-emerald-200' : 'border-rose-200'} bg-slate-50/50`}>
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-400">第 {no} 题</span>
          {ok ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={13} /> 答对 +5 分</span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
              <XCircle size={13} /> {picked ? `答错（选了 ${picked}）` : '未作答'} · 正确答案 {q.answer}
            </span>
          )}
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[q.cat]}`}>{q.cat} · {q.sub}</span>
        </div>
        <h3 className="text-[15px] font-semibold text-slate-800 leading-relaxed">{q.stem}</h3>
      </div>
      <div className="px-5 py-3 space-y-1.5">
        {LETTERS.map(L => (
          <div
            key={L}
            className={`flex items-start gap-2.5 rounded-md px-3 py-2 text-sm ${
              L === q.answer ? 'bg-emerald-50 text-emerald-800 font-medium' : L === picked ? 'bg-rose-50 text-rose-700' : 'text-slate-600'
            }`}
          >
            <span className="font-bold">{L}.</span>
            <span>{q.options[L]}</span>
          </div>
        ))}
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mt-2 leading-relaxed">解析：{q.exp}</p>
      </div>
    </div>
  )
}
