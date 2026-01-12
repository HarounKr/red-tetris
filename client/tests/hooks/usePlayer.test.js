import { describe, expect, it, vi,  } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayer } from '../../src/components/hooks/usePlayer'
import { createStage } from '../../src/game/gameHelpers'
import { TETROMINOS } from '../../src/tetrominos'


describe('usePlayer', () => {
    it('Tester la roation', () => {
        const sharedSequence =  ['I', 'O', 'I'];
        const sound = true;
        const stage = createStage(20, 10);
        const afterRotation = [
                                [0, 'J', 'J'],
                                [0, 'J', 0],
                                [0, 'J', 0]
                            ]
        const { result } = renderHook(() => usePlayer(sharedSequence, sound));

        const setPlayer = result.current[5];
        act(( ) => {
            const newPlayer = {
                pos: { x: 3, y: 0 },
                tetromino: TETROMINOS['J'].shape,
                collided: false,
            }
            
            setPlayer(newPlayer);
            
        })

        act(( ) => {
            const playerRotate = result.current[4];
            playerRotate(stage, 1);
        })

        const player = result.current[0]
        expect(player.tetromino).toStrictEqual(afterRotation);

        // tester lors d'une collision à droite
        act(( ) => {
            const newPlayer = {
                pos: { x: 9, y: 0 },
                tetromino: TETROMINOS['J'].shape,
                collided: false,
            }
            
            setPlayer(newPlayer);
        })

        act(() => {
            const playerRotate = result.current[4];

            playerRotate(stage, 1);
        })
        const playerCollided = result.current[0]
        expect(playerCollided.tetromino).toStrictEqual(TETROMINOS['J'].shape)
    })
})