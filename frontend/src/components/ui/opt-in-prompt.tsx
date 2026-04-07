'use client'

import { useOnboarding } from '@/onboarding/context'
import { motion, AnimatePresence } from 'framer-motion'
import LordIcon from '@/components/ui/lord-icon'

export default function OptInPrompt() {
  const { showOptIn, optIn } = useOnboarding()

  return (
    <AnimatePresence>
      {showOptIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="clarity-card"
            style={{
              maxWidth: 400,
              width: '90%',
              padding: '28px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <LordIcon name="system-regular-121-bulb-hover-bulb" size={40} trigger="loop" />
            </div>

            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--foreground)',
              fontFamily: 'var(--font-heading)',
              marginBottom: 8,
            }}>
              Welcome to Veduwa!
            </h3>

            <p style={{
              fontSize: '13px',
              lineHeight: 1.7,
              color: 'var(--secondary)',
              marginBottom: 24,
            }}>
              Would you like a quick guided tour? We&apos;ll highlight key features
              on each page to help you get started.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => optIn(false)}
                className="btn btn--secondary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Skip
              </button>
              <button
                onClick={() => optIn(true)}
                className="btn btn--primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Show me around
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
