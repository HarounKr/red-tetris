import { describe, expect, it, vi } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import { useSpectrums } from '../../src/components/hooks/useSpectrums';

describe('useSpectrum', () => {
    const socket = {id: 1};
    const score = 10;
    const stage = [ 
        [ [ '0', 'clear' ] ],
        [ [ '0', 'clear' ] ],
    ];
    const setPlayersSpectrums = vi.fn();
    const createStage = vi.fn(() => stage);

    it('Tester lorsque otherPlayers est null', () => {
        const socket = {id: 0}
        const score = 50;

        renderHook(() => {
            useSpectrums(
                {
                    otherPlayers: null,
                    setPlayersSpectrums,
                    socket: socket,
                    stage: stage,
                    score: score,
                    createStage,
                }
            )
        })
        expect(setPlayersSpectrums).toHaveBeenCalledTimes(1);
        expect(setPlayersSpectrums.mock.calls[0][0]).toHaveLength(0);
        expect(createStage).not.toHaveBeenCalled();

        // clear pour recommencer le test de 0
        setPlayersSpectrums.mockClear()
    })

    it('Tester lorsque otherPlayers est rempli et que createStage a bien été appelé', () => {
        const otherPlayers = [
          { socketId: 1, name: 'Haroun', score: 10, stage:stage},
          { socketId: 2, name: 'Wanis', score: 5, stage: [] },
        ]
        renderHook(() => {
            useSpectrums(
                {
                    otherPlayers: otherPlayers,
                    setPlayersSpectrums,
                    socket: socket,
                    stage: stage,
                    score: score,
                    createStage,
                }
            )
        })

        expect(createStage).toHaveBeenCalledTimes(1);
        expect(setPlayersSpectrums).toHaveBeenCalledTimes(1);
    
        const arg = setPlayersSpectrums.mock.calls[0][0]
        expect(arg[0].player.name).toBe('You') // Haroun
        expect(arg[0].player.score).toBe(10)
        expect(arg[0].player.socketId).toBe(1)
        expect(arg[0].spectrum).toStrictEqual(stage)
       
        expect(arg[1].player.name).toBe('Wanis')
        expect(arg[1].player.score).toBe(5);
        expect(arg[1].player.socketId).toBe(2);
        expect(arg[1].spectrum).toStrictEqual(stage)
        
        setPlayersSpectrums.mockClear();
        createStage.mockClear();
    })

    it('Tester lorsque le score d un joueur est null', () => {

        const otherPlayers = [
          { socketId: 1, name: 'Haroun', score: 10, stage:stage},
          { socketId: 2, name: 'Wanis', score: null, stage: [] },
        ]

        renderHook(() => {
            useSpectrums(
                {
                    otherPlayers: otherPlayers,
                    setPlayersSpectrums,
                    socket: socket,
                    stage: stage,
                    score: score,
                    createStage,
                }
            )
        })

        const arg = setPlayersSpectrums.mock.calls[0][0];
        expect(arg[1].player.score).toBe(0)
    })
})