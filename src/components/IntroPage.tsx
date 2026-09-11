import { ExternalLink, CalendarClock, MonitorCheck, ShieldCheck, Phone, MousePointerClick } from 'lucide-react'

const SESSIONS = [
  ['第一场', '8:30 – 9:00', '9:00 – 10:00'],
  ['第二场', '10:00 – 10:30', '10:30 – 11:30'],
  ['第三场', '13:30 – 14:00', '14:00 – 15:00'],
  ['第四场', '15:00 – 15:30', '15:30 – 16:30'],
  ['第五场', '19:00 – 19:30', '19:30 – 20:30'],
]

const NOTICES = [
  '请确保网络连接稳定，避免测评过程中断网',
  '测评期间请勿关闭浏览器或离开当前页面',
  '请仔细阅读每道题目，按要求完成作答',
  '如有技术问题，请及时联系技术支持老师',
  '组委会将全程线上监考核查，违规者取消参赛成绩',
]

const RULES = [
  '所有题目必须由选手独立作答，禁止替考、他人代做',
  '禁止使用电子设备搜索答案、禁止场外传递解题思路',
  '不录制、不传播赛事试题与赛事内容',
  '指导教师仅可公益指导方法，不得代替完成核心赛事内容',
]

export default function IntroPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
      {/* 正式考试入口 */}
      <a
        href="https://signup.simcc.net.cn/dashboard"
        target="_blank"
        rel="noreferrer"
        className="block bg-gradient-to-r from-[#0f2a4a] to-[#1a4a7a] rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-widest text-sky-300 font-semibold mb-1">OFFICIAL PORTAL</div>
            <div className="text-xl font-bold">正式考试入口：大赛报名测评平台</div>
            <div className="mt-1.5 text-sm text-sky-200/90 flex items-center gap-1.5">
              <MousePointerClick size={14} />
              登录 signup.simcc.net.cn → 赛事足迹 → 点击「参加测评」
            </div>
          </div>
          <ExternalLink size={28} className="text-sky-300 shrink-0" />
        </div>
      </a>

      {/* 考试安排 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
          <CalendarClock size={18} className="text-blue-600" /> 初赛时间安排
        </h2>
        <div className="flex gap-3 mb-4">
          <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold">第一轮：9月12日</span>
          <span className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-bold">第二轮：9月19日</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">场次</th>
              <th className="py-2 font-medium">等候入场</th>
              <th className="py-2 font-medium">答题时间（60 分钟）</th>
            </tr>
          </thead>
          <tbody>
            {SESSIONS.map(([n, w, t]) => (
              <tr key={n} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 font-medium text-slate-700">{n}</td>
                <td className="py-2.5 text-slate-500">{w}</td>
                <td className="py-2.5 text-slate-800 font-semibold">{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-400">两天共 10 个场次，不限组别，任选一场参加。建议提前 30 分钟进入系统等候。</p>
      </section>

      {/* 考试规则 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
          <MonitorCheck size={18} className="text-blue-600" /> 初赛规则
        </h2>
        <div className="grid grid-cols-2 gap-3 text-center">
          {[
            ['20 道', '单项选择题（系统随机抽取）'],
            ['100 分', '每题 5 分，答错不扣分'],
            ['60 分钟', '统一答题时长，自动阅卷'],
            ['达标制', '达合格线即晋级，不设淘汰比例'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-4">
              <div className="text-xl font-black text-blue-700">{k}</div>
              <div className="mt-1 text-xs text-slate-500">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 注意事项 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-3">
          <ShieldCheck size={18} className="text-amber-500" /> 测评注意事项（官方）
        </h2>
        <ol className="space-y-2">
          {NOTICES.map((n, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              {n}
            </li>
          ))}
        </ol>
        <h3 className="text-sm font-bold text-slate-700 mt-5 mb-2">诚信参赛要求</h3>
        <ul className="space-y-1.5">
          {RULES.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="text-rose-400 shrink-0">•</span>
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-sky-50 border border-sky-100 px-4 py-3 text-sm text-sky-800">
          <Phone size={15} className="shrink-0" />
          C5 赛项技术支持：洪老师 155-2113-2993（设备或网络异常请第一时间联系报备）
        </div>
      </section>

      <p className="text-center text-xs text-slate-400 pb-4">
        本系统为备考练习工具，题目为按官方考试范围命制的模拟题，非官方真题。正式考试以大赛组委会通知为准。
      </p>
    </div>
  )
}
