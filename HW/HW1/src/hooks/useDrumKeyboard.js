import { useEffect, useRef } from 'react'

/**
 * Custom hook to listen to physical keyboard triggers for the Drum Kit.
 * Uses e.code exclusively to remain immune to IME compositions (e.g. UniKey Telex).
 *
 * @param {Map<string, { id: string, label: string, code: string }>} padMap
 * @param {(padId: string, phase: 'down' | 'up') => void} onTriggerPad
 * @param {boolean} [isEnabled=true]
 */
export function useDrumKeyboard(padMap, onTriggerPad, isEnabled = true) {
  // Ref bridge for onTriggerPad callback to avoid stale closures
  const callbackRef = useRef(onTriggerPad)
  useEffect(() => {
    callbackRef.current = onTriggerPad
  }, [onTriggerPad])

  const padMapRef = useRef(padMap)
  useEffect(() => {
    padMapRef.current = padMap
  }, [padMap])

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return

    const handleKeyDown = (e) => {
      // Guard 1: Ignore hardware repeat when a key is continuously held down
      if (e.repeat) return

      // Guard 2: Ignore typing inside text inputs, textareas, or dropdowns
      const target = e.target
      const tagName = target?.tagName
      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }

      // Hardware key code matching (e.g. 'KeyW')
      const pad = padMapRef.current?.get(e.code)
      if (pad) {
        // Prevent default only for mapped keys (prevents scroll / unintended shortcuts)
        e.preventDefault()
        callbackRef.current?.(pad.id, 'down')
      }
    }

    const handleKeyUp = (e) => {
      const pad = padMapRef.current?.get(e.code)
      if (pad) {
        callbackRef.current?.(pad.id, 'up')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isEnabled])
}
