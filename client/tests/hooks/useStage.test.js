import { describe, expect, it, vi } from 'vitest'
import { render, renderHook, screen, act } from '@testing-library/react'
import { useStage } from '../../src/components/hooks/useStage'
import { TETROMINOS } from '../../src/tetrominos'
import { createStage } from '../../src/game/gameHelpers'



describe('useStage', () => {
    it('Tester les pénalités', () => {
        const player = {
            pos: { x: 0, y: 0 },
            tetromino:  TETROMINOS[0].shape,
            collided: false,
        }

        const panalityArray = Array(10).fill(['P', 'merged']);
        const resetPlayer = () => {}

        const { result } = renderHook(() => useStage(player, resetPlayer));
        
        // ajouter 2 lignes de Pénalités
        act(( ) => {
            result.current[4](2)
            console.log(result.current[3](null))

        })

        const stage = result.current[0];
        expect(stage).toHaveLength(20);
        
        expect(stage[18]).toStrictEqual(panalityArray);
        expect(stage[19]).toStrictEqual(panalityArray);


    })
})