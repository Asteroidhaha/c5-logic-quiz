import { useMemo, useState } from 'react'
import QuizSidebar from '../components/QuizSidebar'
import PracticeQuiz from '../components/PracticeQuiz'
import ExamQuiz from '../components/ExamQuiz'
import IntroPage from '../components/IntroPage'
import { filterQuestions, drawExam, shuffle, QUESTIONS, type Question } from '../data'
import { GraduationCap, User } from 'lucide-react'
import '../App.css'

export default function Home() {
  const [mode, setMode] = useState<'practice' | 'exam' | 'intro'>('intro')
  const [selCat, setSelCat] = useState<string | null>(null)
  const [selSub, setSelSub] = useState<string | null>(null)
  const [examQs, setExamQs] = useState<Question[]>([])
  const [examRound, setExamRound] = useState(0)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [shuffled, setShuffled] = useState<Question[] | null>(null)

  const baseList = useMemo(() => filterQuestions(selCat, selSub), [selCat, selSub])
  const practiceList = shuffled && shuffleKey > 0 ? shuffled : baseList

  const title = selSub ?? selCat ?? '全部题目'

  function startExam() {
    setExamQs(drawExam())
    setExamRound(r => r + 1)
    setMode('exam')
  }

  function pick(cat: string | null, sub: string | null) {
    setSelCat(cat)
    setSelSub(sub)
    setShuffled(null)
    setShuffleKey(0)
    setMode('practice')
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800" style={{ fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      {/* 顶栏：仿真报名/测评系统风格 */}
      <header className="h-14 shrink-0 bg-[#0b2140] text-white flex items-center px-5 gap-3 shadow-md z-10">
        <GraduationCap size={22} className="text-sky-300" />
        <div>
          <div className="text-sm font-bold leading-tight">全国青少年科学探究建模能力大赛 · C5 逻辑思维建模（含幼小衔接专项）</div>
          <div className="text-[11px] text-sky-300/80 leading-tight">初赛在线练习与模拟测评系统 · 题库 {QUESTIONS.length} 题</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-300">
          <User size={14} />
          <span>考生：常清溪 · 小学低年级组（一年级）</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <QuizSidebar
          mode={mode}
          selCat={selCat}
          selSub={selSub}
          onPick={pick}
          onShowIntro={() => setMode('intro')}
          onStartExam={startExam}
          examActive={false}
        />

        <main className="flex-1 overflow-y-auto">
          {mode === 'intro' ? (
            <IntroPage />
          ) : mode === 'practice' ? (
            <PracticeQuiz
              title={title}
              questions={practiceList}
              shuffleKey={shuffleKey}
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
