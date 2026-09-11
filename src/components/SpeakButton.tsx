import { useEffect, useState } from 'react'
import { Volume2, Square } from 'lucide-react'

interface Props {
  text: string
  className?: string
}

/** 朗读按钮：用浏览器语音合成播报题目（中文、语速略慢，适合低年级孩子） */
export default function SpeakButton({ text, className = '' }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported, text])

  if (!supported) return null

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.85
    u.pitch = 1.05
    const voices = window.speechSynthesis.getVoices()
    const zh = voices.find(v => v.lang.startsWith('zh') && v.localService) ?? voices.find(v => v.lang.startsWith('zh'))
    if (zh) u.voice = zh
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(u)
  }

  return (
    <button
      onClick={toggle}
      title={speaking ? '停止朗读' : '朗读题目'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        speaking
          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
          : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
      } ${className}`}
    >
      {speaking ? <Square size={12} /> : <Volume2 size={13} />}
      {speaking ? '停止' : '朗读题目'}
    </button>
  )
}

/** 把一道题拼成适合朗读的文本 */
export function questionToSpeech(stem: string, options: Record<string, string>, no?: number): string {
  const parts = []
  if (no) parts.push(`第 ${no} 题`)
  parts.push(stem)
  for (const L of ['A', 'B', 'C', 'D']) {
    if (options[L]) parts.push(`选项 ${L}：${options[L]}`)
  }
  return parts.join('。')
}
