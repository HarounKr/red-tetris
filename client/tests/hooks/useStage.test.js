import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStage } from '../../src/components/hooks/useStage'
import { TETROMINOS } from '../../src/tetrominos'


describe('useStage', () => {
    it('Tester les pénalités ', () => {
        const player = {
            pos: { x: 0, y: 0 },
            tetromino:  TETROMINOS[0].shape,
            collided: false,
        }

        const panalityArray = Array(10).fill(['P', 'merged']);
        const resetPlayer = () => {};

        const { result } = renderHook(() => useStage(player, resetPlayer));
        
        // ajouter 2 lignes de Pénalités
        act(( ) => {
            const addPenaltyRows = result.current[4]
            addPenaltyRows(2);
        })

        const stage = result.current[0];
        expect(stage).toHaveLength(20);
        
        expect(stage[18]).toStrictEqual(panalityArray);
        expect(stage[19]).toStrictEqual(panalityArray);
    })

    it('Tester le reset de la position du joueur lors d une collision ainsi que la suppression d une ligne', () => {
         const player = {
            pos: { x: 0, y: 0 },
            tetromino:  TETROMINOS[0].shape,
            collided: true,
        }
        const resetPlayer = vi.fn();

        const { result, rerender } = renderHook(( { p }) => useStage(p, resetPlayer), { initialProps: { p: player} });
        
        expect(resetPlayer).toHaveBeenCalledTimes(1);

        act(() => {
            const stage = [
                [ [0, 'clear', 0, 'clear']],
                [ ['J', 'merged'], 'J', 'merged'],
            ]
            const setStage = result.current[1];
            setStage(stage)
        })
        
        rerender({ p: { ...player} })
        const rowsCleared = result.current[2];

        expect(rowsCleared).toBe(1);
    }) 
})