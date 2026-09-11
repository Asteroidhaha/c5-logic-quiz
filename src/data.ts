import raw from './questions.json'

export interface Question {
  id: number
  cat: string
  sub: string
  diff: '基础' | '进阶' | '拔高'
  stem: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  answer: 'A' | 'B' | 'C' | 'D'
  exp: string
}

export const QUESTIONS = raw as Question[]

export const CATS = ['科学常识', '基础探究方法', '逻辑思维基础'] as const

export function subsOf(cat: string): { name: string; count: number }[] {
  const map = new Map<string, number>()
  QUESTIONS.filter(q => q.cat === cat).forEach(q => map.set(q.sub, (map.get(q.sub) ?? 0) + 1))
  return [...map.entries()].map(([name, count]) => ({ name, count }))
}

export function countOf(cat: string): number {
  return QUESTIONS.filter(q => q.cat === cat).length
}

export function filterQuestions(cat: string | null, sub: string | null): Question[] {
  return QUESTIONS.filter(q => (!cat || q.cat === cat) && (!sub || q.sub === sub))
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 模拟真实考试：随机抽 20 题 */
export function drawExam(): Question[] {
  return shuffle(QUESTIONS).slice(0, 20)
}

export const LETTERS = ['A', 'B', 'C', 'D'] as const
export type Letter = (typeof LETTERS)[number]

export const DIFF_STYLE: Record<string, string> = {
  基础: 'bg-emerald-100 text-emerald-700',
  进阶: 'bg-amber-100 text-amber-700',
  拔高: 'bg-rose-100 text-rose-700',
}

export const CAT_COLOR: Record<string, string> = {
  科学常识: 'bg-sky-100 text-sky-700',
  基础探究方法: 'bg-violet-100 text-violet-700',
  逻辑思维基础: 'bg-teal-100 text-teal-700',
}
