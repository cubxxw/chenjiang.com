'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import type { Locale } from '@/i18n'

type Phase = 'write' | 'hold' | 'observe' | 'release'

export default function ThoughtPractice({ locale }: { locale: Locale }) {
  const zh = locale === 'zh'
  const [thought, setThought] = useState('')
  const [phase, setPhase] = useState<Phase>('write')
  const chars = useMemo(() => Array.from(thought), [thought])

  const reset = () => {
    setThought('')
    setPhase('write')
  }

  return (
    <section className={`thought-practice phase-${phase}`}>
      <div className="thought-index">{zh ? '一念' : 'A THOUGHT'}</div>
      <div className="thought-stage" aria-live="polite">
        {phase === 'write' ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (thought.trim()) setPhase('hold')
            }}
          >
            <input
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              placeholder={zh ? '写下一念' : 'Write one thought'}
              maxLength={28}
              aria-label={zh ? '写下一个念头' : 'Write a thought'}
              autoComplete="off"
            />
            <button type="submit">{zh ? '置于此' : 'PLACE'}</button>
          </form>
        ) : (
          <div className="thought-object">
            {chars.map((char, index) => (
              <span
                key={`${char}-${index}`}
                style={{ '--i': index, '--n': chars.length } as CSSProperties}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="thought-controls">
        {phase === 'hold' && <button onClick={() => setPhase('observe')}>{zh ? '观' : 'OBSERVE'}</button>}
        {phase === 'observe' && <button onClick={() => setPhase('release')}>{zh ? '放' : 'RELEASE'}</button>}
        {phase === 'release' && <button onClick={reset}>{zh ? '再来' : 'AGAIN'}</button>}
        <span>{phase === 'hold' ? '执' : phase === 'observe' ? '观' : phase === 'release' ? '空' : '·'}</span>
      </div>
    </section>
  )
}
