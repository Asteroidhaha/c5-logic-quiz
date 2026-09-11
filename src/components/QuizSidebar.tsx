import { useState } from 'react'
import { CATS, subsOf, countOf, QUESTIONS } from '../data'
import { useRecords, wrongIds, resetRecords, statsOf } from '../store'
import { ClipboardList, ChevronDown, ChevronRight, Timer, BookOpen, Info, BookmarkX, Trash2 } from 'lucide-react'

interface Props {
  mode: 'practice' | 'exam' | 'intro'
  selCat: string | null
  selSub: string | null
  selWrong: boolean
  onPick: (cat: string | null, sub: string | null) => void
  onPickWrong: () => void
  onShowIntro: () => void
  onStartExam: () => void
  examActive: boolean
}

export default function QuizSidebar({ mode, selCat, selSub, selWrong, onPick, onPickWrong, onShowIntro, onStartExam, examActive }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ 科学常识: true, 基础探究方法: true, 逻辑思维基础: true })
  const records = useRecords()
  const wrongs = wrongIds()
  const stats = statsOf(records)

  const itemCls = (active: boolean) =>
    `w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors flex items-center justify-between gap-2 ${
      active ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`

  return (
    <aside className="w-64 shrink-0 bg-[#0f2a4a] text-white flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-5 pb-4 border-b border-white/10">
        <div className="text-[11px] tracking-widest text-sky-300/80 font-semibold">PRACTICE MODE</div>
        <div className="mt-1 text-sm font-bold">分类练习</div>
        <div className="mt-2 flex gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300">已做 {stats.done}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">对 {stats.right}</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">错 {stats.wrong}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1">
        <button className={itemCls(mode === 'intro')} onClick={onShowIntro}>
          <span className="flex items-center gap-2"><Info size={14} />赛前须知 · 考试入口</span>
        </button>

        <button
          className={`${itemCls(mode === 'practice' && selWrong)} ${wrongs.length > 0 ? '' : 'opacity-60'}`}
          onClick={onPickWrong}
        >
          <span className="flex items-center gap-2"><BookmarkX size={14} />错题本</span>
          <span className={`text-xs ${mode === 'practice' && selWrong ? 'opacity-70' : 'text-rose-300 font-bold'}`}>{wrongs.length}</span>
        </button>

        <button className={itemCls(mode === 'practice' && !selWrong && !selCat && !selSub)} onClick={() => onPick(null, null)}>
          <span className="flex items-center gap-2"><BookOpen size={14} />全部题目</span>
          <span className="text-xs opacity-70">{QUESTIONS.length}</span>
        </button>

        {CATS.map(cat => (
          <div key={cat}>
            <div
              className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-[13px] ${
                mode === 'practice' && !selWrong && selCat === cat && !selSub ? 'bg-blue-600 text-white font-medium' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <button className="flex-1 text-left" onClick={() => onPick(cat, null)}>
                {cat}
                <span className="ml-2 text-xs opacity-70">{countOf(cat)}</span>
              </button>
              <button onClick={() => setOpen(o => ({ ...o, [cat]: !o[cat] }))} className="p-0.5 opacity-70 hover:opacity-100">
                {open[cat] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            {open[cat] && (
              <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                {subsOf(cat).map(s => (
                  <button key={s.name} className={itemCls(mode === 'practice' && !selWrong && selSub === s.name)} onClick={() => onPick(cat, s.name)}>
                    <span>{s.name}</span>
                    <span className="text-xs opacity-70">{s.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        <div>
          <div className="text-[11px] tracking-widest text-sky-300/80 font-semibold mb-2">MOCK EXAM</div>
          <button
            onClick={onStartExam}
            disabled={examActive}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f2a4a] font-bold text-sm px-3 py-2.5 transition-colors"
          >
            <ClipboardList size={16} />
            {mode === 'exam' ? '重新生成模拟卷' : '生成模拟卷（随机20题）'}
          </button>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Timer size={12} /> 20 题 · 每题 5 分 · 限时 60 分钟（与正式初赛一致）
          </div>
        </div>

        {stats.done > 0 && (
          <button
            onClick={() => {
              if (window.confirm(`确定清空全部答题记录吗？\n已记录 ${stats.done} 题（对 ${stats.right} / 错 ${stats.wrong}），清空后不可恢复。`)) {
                resetRecords()
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/15 text-slate-400 hover:text-rose-300 hover:border-rose-400/40 text-xs px-3 py-2 transition-colors"
          >
            <Trash2 size={13} /> 重置答题记录
          </button>
        )}
      </div>
    </aside>
  )
}
