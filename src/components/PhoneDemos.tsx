import { type ReactNode } from 'react'

/* ─────────────────────────────────────────────
   Floating card that pops out of the phone
   ───────────────────────────────────────────── */

function FloatingCard({
  children,
  className = '',
  delay = 0,
  position,
}: {
  children: ReactNode
  className?: string
  delay?: number
  position: string
}) {
  return (
    <div
      className={`absolute z-30 floating-card ${position} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-white rounded-[14px] px-3.5 py-3 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)] backdrop-blur-sm">
        {children}
      </div>
    </div>
  )
}

function MiniTag({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="text-[8px] font-bold px-2 py-[3px] rounded-full"
      style={{ background: `${color}12`, color }}
    >
      {text}
    </span>
  )
}

/* ═════════════════════════════════════════════
   1. CHAT — Screenshot + floating cards
   ═════════════════════════════════════════════ */

export function ChatShowcase() {
  return (
    <div className="relative">
      {/* Floating: voice waveform card */}
      <FloatingCard position="top-4 -left-6 lg:-left-14" delay={200}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E83E73] to-[#c42d63] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#0A0A0A]">Voice check-in</p>
            <div className="flex items-center gap-[2px] mt-1">
              {[3,5,8,6,9,4,7,10,6,8,5,3,6,9,7,4].map((h, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-[#E83E73]"
                  style={{ height: `${h}px`, opacity: 0.3 + (i / 16) * 0.7, animation: `wave 1.2s ease-in-out ${i * 0.06}s infinite alternate` }}
                />
              ))}
            </div>
          </div>
        </div>
      </FloatingCard>

      {/* Floating: logged badge */}
      <FloatingCard position="-bottom-2 -right-4 lg:-right-12" delay={600}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#34C759]/10 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#0A0A0A]">Symptoms logged</p>
            <p className="text-[7px] text-[#0A0A0A]/30 mt-[1px]">Sleep · Mood · Energy</p>
          </div>
        </div>
      </FloatingCard>

      {/* Floating: 2min badge */}
      <FloatingCard position="top-1/3 -right-3 lg:-right-10" delay={400}>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px]">⏱</span>
          <p className="text-[9px] font-bold text-[#0A0A0A]">Under 2 min</p>
        </div>
      </FloatingCard>

      {/* Phone */}
      <PhoneFrame src="/images/app-chat.png" alt="Helene chat interface" />
    </div>
  )
}

/* ═════════════════════════════════════════════
   2. DASHBOARD — Screenshot + floating cards
   ═════════════════════════════════════════════ */

export function DashboardShowcase() {
  return (
    <div className="relative">
      {/* Floating: MRS Score */}
      <FloatingCard position="top-6 -right-4 lg:-right-14" delay={200}>
        <div className="flex items-center gap-3">
          <div className="relative w-[40px] h-[40px] flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#0A0A0A" strokeOpacity="0.05" strokeWidth="3" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#E83E73" strokeWidth="3" strokeLinecap="round" strokeDasharray="28 88" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#0A0A0A]">14</span>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#0A0A0A]">MRS Score</p>
            <div className="flex items-center gap-1 mt-[2px]">
              <svg width="8" height="8" viewBox="0 0 12 12" fill="#34C759"><path d="M6 1L1 8h10z"/></svg>
              <span className="text-[8px] font-semibold text-[#34C759]">-3 pts this week</span>
            </div>
          </div>
        </div>
      </FloatingCard>

      {/* Floating: Sleep trend */}
      <FloatingCard position="-bottom-2 -left-4 lg:-left-12" delay={500}>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] font-semibold text-[#0A0A0A]">Sleep quality</p>
            <MiniTag text="+12%" color="#6366f1" />
          </div>
          <div className="flex items-end gap-[3px] h-[24px]">
            {[4, 3, 5, 4, 6, 5, 7].map((v, i) => (
              <div
                key={i}
                className="w-[6px] rounded-[2px]"
                style={{
                  height: `${(v / 10) * 100}%`,
                  background: i === 6 ? '#6366f1' : '#6366f1',
                  opacity: i === 6 ? 1 : 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </FloatingCard>

      {/* Floating: Weekly insight */}
      <FloatingCard position="top-1/2 -left-5 lg:-left-16" delay={350}>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px]">💡</span>
          <p className="text-[9px] font-semibold text-[#0A0A0A]">Weekly insight ready</p>
        </div>
      </FloatingCard>

      {/* Phone */}
      <PhoneFrame src="/images/app-dashboard.png" alt="Helene insights dashboard" />
    </div>
  )
}

/* ═════════════════════════════════════════════
   3. COMMUNITY — Screenshot + floating cards
   ═════════════════════════════════════════════ */

export function CommunityShowcase() {
  return (
    <div className="relative">
      {/* Floating: active members */}
      <FloatingCard position="top-6 -right-4 lg:-right-14" delay={200}>
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {['#E83E73', '#6366f1', '#FF9500', '#34C759'].map((c, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-[1.5px] border-white flex items-center justify-center"
                style={{ background: `${c}18`, zIndex: 4 - i }}
              >
                <span className="text-[7px] font-bold" style={{ color: c }}>
                  {['ML', 'SD', 'IK', 'NR'][i]}
                </span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#0A0A0A]">2,400+ women</p>
            <p className="text-[7px] text-[#0A0A0A]/30 mt-[1px]">128 active now</p>
          </div>
        </div>
      </FloatingCard>

      {/* Floating: notification */}
      <FloatingCard position="-bottom-2 -left-4 lg:-left-12" delay={500}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E83E73]/10 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#E83E73"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#0A0A0A]">Sophie liked your post</p>
            <p className="text-[7px] text-[#0A0A0A]/30 mt-[1px]">Just now</p>
          </div>
        </div>
      </FloatingCard>

      {/* Floating: safe space */}
      <FloatingCard position="top-1/3 -left-5 lg:-left-14" delay={350}>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px]">🛡️</span>
          <p className="text-[9px] font-semibold text-[#0A0A0A]">Safe & moderated</p>
        </div>
      </FloatingCard>

      {/* Phone */}
      <PhoneFrame src="/images/app-community.png" alt="Helene community feed" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Premium phone frame
   ───────────────────────────────────────────── */

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto" style={{ width: '260px', maxWidth: '100%' }}>
      {/* Outer shell — titanium bezel effect */}
      <div
        className="relative rounded-[48px] p-[8px]"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
          boxShadow: `
            0 2px 0 0 rgba(255,255,255,0.04) inset,
            0 -1px 0 0 rgba(0,0,0,0.3) inset,
            0 32px 80px -12px rgba(0,0,0,0.35),
            0 12px 24px -4px rgba(0,0,0,0.15)
          `,
        }}
      >
        {/* Dynamic Island */}
        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 z-20">
          <div className="w-[76px] h-[22px] bg-black rounded-full flex items-center justify-center gap-2">
            <div className="w-[6px] h-[6px] rounded-full bg-[#1a1a1a] ring-1 ring-[#333]" />
          </div>
        </div>

        {/* Screen */}
        <div className="rounded-[40px] overflow-hidden bg-black">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto block"
            style={{ aspectRatio: '9/19.5' }}
            draggable={false}
          />
        </div>

        {/* Screen edge highlight */}
        <div
          className="absolute inset-[8px] rounded-[40px] pointer-events-none"
          style={{
            boxShadow: '0 0.5px 0 0 rgba(255,255,255,0.06) inset',
          }}
        />
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[96px] h-[4px] rounded-full bg-white/15 z-10" />

      {/* Side buttons — volume */}
      <div className="absolute top-[100px] -left-[2.5px] w-[3px] h-[24px] rounded-l-[2px] bg-[#2a2a2a]" style={{ boxShadow: '-1px 0 2px rgba(0,0,0,0.3)' }} />
      <div className="absolute top-[132px] -left-[2.5px] w-[3px] h-[24px] rounded-l-[2px] bg-[#2a2a2a]" style={{ boxShadow: '-1px 0 2px rgba(0,0,0,0.3)' }} />
      {/* Side button — power */}
      <div className="absolute top-[116px] -right-[2.5px] w-[3px] h-[36px] rounded-r-[2px] bg-[#2a2a2a]" style={{ boxShadow: '1px 0 2px rgba(0,0,0,0.3)' }} />
    </div>
  )
}
