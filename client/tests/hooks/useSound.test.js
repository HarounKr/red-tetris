import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSound } from '../../src/components/hooks/useSound'


describe('useSound', () => {
    it('Tester que le son fonctionne', () => {
        const sound = true;
        const audioRef = {
            current: {
                currentTime: 1,
                play: vi.fn()
            }
        }

        const { result } = renderHook(() => useSound(sound))

        const playSound = result.current[3];

        playSound(audioRef);

        expect(audioRef.current.currentTime).toBe(0);
        expect(audioRef.current.play).toHaveBeenCalledTimes(1)
    })
    
})