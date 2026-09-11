import { useSyncExternalStore } from 'react'

export type Result = 'right' | 'wrong'
export interface Rec { tries: number; right: number; last: Result }
export type Records = Record<number, Rec>

const KEY = 'c5-quiz-records-v1'
let cache: Records | null = null
const listeners = new Set<() => void>()

function load(): Records {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '{}') as Records
  } catch {
    cache = {}
  }
  return cache
}

function persist(next: Records) {
  cache = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 隐私模式等场景忽略 */ }
  listeners.forEach(l => l())
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function getRecords(): Records {
  return load()
}

export function markResult(id: number, ok: boolean) {
  const r = load()
  const cur = r[id] ?? { tries: 0, right: 0, last: 'wrong' as Result }
  const updated: Rec = { tries: cur.tries + 1, right: cur.right + (ok ? 1 : 0), last: ok ? 'right' : 'wrong' }
  persist({ ...r, [id]: updated })
}

export function resetRecords() {
  persist({})
}

/** 当前仍处于答错状态（最近一次答错）的题号 */
export function wrongIds(): number[] {
  return Object.entries(load())
    .filter(([, v]) => v.last === 'wrong')
    .map(([k]) => Number(k))
    .sort((a, b) => a - b)
}

export function statsOf(records: Records): { done: number; right: number; wrong: number } {
  let done = 0, right = 0, wrong = 0
  for (const v of Object.values(records)) {
    done++
    if (v.last === 'right') right++
    else wrong++
  }
  return { done, right, wrong }
}

/** 组件订阅答题记录 */
export function useRecords(): Records {
  return useSyncExternalStore(subscribe, getRecords)
}
