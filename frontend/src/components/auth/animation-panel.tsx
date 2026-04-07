'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import VeduwaLogo from '@/components/ui/veduwa-logo'

export default function AnimationPanel() {
  const { RiveComponent } = useRive({
    src: '/animations/rive/factory-pipeline.riv',
    autoplay: true,
    stateMachines: 'State Machine 1',
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  })

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0a1628] to-[#162040] overflow-hidden">
      {/* Rive animation fills the panel */}
      <div className="absolute inset-0 opacity-80">
        <RiveComponent />
      </div>

      {/* Overlay content - pointer-events-none so clicks pass through to Rive */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
        <VeduwaLogo size="md" className="[&_span]:text-white [&_div]:bg-white/20 pointer-events-auto" />

        <div className="max-w-[320px] pointer-events-auto">
          <h2 className="text-[26px] font-heading font-bold text-white tracking-tight leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)' }}>
            AI-Powered
            <br />
            Talent Matching
          </h2>
          <p className="text-[13px] text-white/90 mt-3 leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            Vector embeddings, cosine similarity, and Claude AI screening — all working together to find your perfect hire.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex -space-x-1.5">
              {['SC', 'MJ', 'ER'].map((initials) => (
                <div key={initials} className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[9px] font-bold text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/80" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>500+ companies trust Veduwa</p>
          </div>
        </div>
      </div>
    </div>
  )
}
