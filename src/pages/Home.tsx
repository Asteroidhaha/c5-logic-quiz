import { useMemo, useState } from 'react'
import QuizSidebar from '../components/QuizSidebar'
import PracticeQuiz from '../components/PracticeQuiz'
import ExamQuiz from '../components/ExamQuiz'
import IntroPage from '../components/IntroPage'
import { filterQuestions, drawExam, shuffle, QUESTIONS, type Question } from '../data'
import { useRecords, wrongIds } from '../store'
import { GraduationCap, User, Menu, X } from 'lucide-react'
import '../App.css'

export default function Home() {
  const [mode, setMode] = useState<'practice' | 'exam' | 'intro'>(() =>
    location.hash === '#practice' ? 'practice' : location.hash === '#exam' ? 'exam' : 'intro',
  )
  const [selCat, setSelCat] = useState<string | null>(null)
  const [selSub, setSelSub] = useState<string | null>(null)
  const [selWrong, setSelWrong] = useState(false)
  const [examQs, setExamQs] = useState<Question[]>(() =>
    location.hash === '#exam' ? drawExam() : [],
  )
  const [examRound, setExamRound] = useState(0)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [shuffled, setShuffled] = useState<Question[] | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const records = useRecords()

  const wrongList = useMemo(
    () => wrongIds().map(id => QUESTIONS.find(q => q.id === id)!).filter(Boolean),
    [records],
  )
  const baseList = useMemo(() => (selWrong ? wrongList : filterQuestions(selCat, selSub)), [selWrong, wrongList, selCat, selSub])
  const practiceList = shuffled && shuffleKey > 0 ? shuffled : baseList

  const title = selWrong ? '错题本' : selSub ?? selCat ?? '全部题目'

  function startExam() {
    setExamQs(drawExam())
    setExamRound(r => r + 1)
    setMode('exam')
  }

  function pick(cat: string | null, sub: string | null) {
    setSelCat(cat)
    setSelSub(sub)
    setSelWrong(false)
    setShuffled(null)
    setShuffleKey(0)
    setMode('practice')
  }

  function pickWrong() {
    setSelCat(null)
    setSelSub(null)
    setSelWrong(true)
    setShuffled(null)
    setShuffleKey(0)
    setMode('practice')
  }

  // 侧边栏回调统一封装：移动端选择后自动收起抽屉
  const closeDrawer = <A extends unknown[]>(fn: (...args: A) => void) =>
    (...args: A) => { fn(...args); setSidebarOpen(false) }
  const sidebarProps = {
    mode,
    selCat,
    selSub,
    selWrong,
    onPick: closeDrawer(pick),
    onPickWrong: closeDrawer(pickWrong),
    onShowIntro: closeDrawer(() => setMode('intro')),
    onStartExam: closeDrawer(startExam),
    examActive: false,
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800" style={{ fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      {/* 顶栏：仿真报名/测评系统风格 */}
      <header className="h-14 shrink-0 bg-[#0b2140] text-white flex items-center px-3 sm:px-5 gap-2 sm:gap-3 shadow-md z-10">
        <button
          className="lg:hidden p-1.5 -ml-1 rounded-md hover:bg-white/10 shrink-0"
          onClick={() => setSidebarOpen(true)}
          aria-label="打开菜单"
        >
          <Menu size={20} />
        </button>
        <GraduationCap size={22} className="text-sky-300 shrink-0 hidden sm:block" />
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight truncate">全国青少年科学探究建模能力大赛 · C5 逻辑思维建模</div>
          <div className="text-[11px] text-sky-300/80 leading-tight truncate">初赛在线练习与模拟测评系统 · 题库 {QUESTIONS.length} 题</div>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-slate-300 shrink-0">
          <User size={14} />
          <span>考生：常清溪 · 小学低年级组（一年级）</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* 桌面端：固定侧边栏 */}
        <div className="hidden lg:block h-full shrink-0">
          <QuizSidebar {...sidebarProps} />
        </div>

        {/* 移动端：抽屉式侧边栏 */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 shadow-2xl">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 -right-10 w-9 h-9 rounded-full bg-white text-slate-700 flex items-center justify-center shadow-md"
                aria-label="关闭菜单"
              >
                <X size={17} />
              </button>
              <QuizSidebar {...sidebarProps} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto min-w-0">
          {mode === 'intro' ? (
            <IntroPage />
          ) : mode === 'practice' ? (
            <PracticeQuiz
              title={title}
              questions={practiceList}
              shuffleKey={shuffleKey}
              isWrongBook={selWrong}
              onShuffle={() => {
                setShuffled(shuffle(baseList))
                setShuffleKey(k => k + 1)
              }}
            />
          ) : (
            <ExamQuiz
              key={examRound}
              questions={examQs}
              onExit={() => setMode('practice')}
              onRestart={startExam}
            />
          )}
        </main>
      </div>
    </div>
  )
}
