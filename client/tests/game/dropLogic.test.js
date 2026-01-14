import { describe, expect, it, vi } from 'vitest'
import { TETROMINOS } from '../../src/tetrominos';
import { createStage } from '../../src/game/gameHelpers';
import { dropLogic } from '../../src/game/dropLogic';

describe('dropLogic', () => {
    const stage = createStage(20,10);

    it('Tester que les fonctions de mise à jour du temps, du niveau, de la mise à jour du position du joueur sont bien appelés', () => {

        const setDropTime = vi.fn();
        const setLevel = vi.fn();
        const updatePlayerPos = vi.fn();
        const playSound = vi.fn();
    

        const player = {
                pos: { x: 3, y: 0 },
                tetromino: TETROMINOS['J'].shape,
                collided: false,
        }

        dropLogic({ 
            type: 'soft', 
            rows: 11, 
            room: 0,
            score: 0, 
            setLevel, 
            level: 0,
            gameModeFromState: 'Standard',
            gravity: { standard: 1000 },
            player, 
            stage, 
            setGameOver: vi.fn(),
            setDropTime,
            hasSubmittedScore: null,
            socket: null, 
            blockHitSoundRef: null, 
            updatePlayerPos, 
            playSound 
        })
            
        expect(setDropTime).toHaveBeenCalledTimes(1);
        expect(setLevel).toHaveBeenCalledTimes(1);
        expect(updatePlayerPos).toHaveBeenCalled(1);
        expect(playSound).not.toHaveBeenCalled();
    })

    it('Tester le mode hard', () => {
         const player = {
                pos: { x: 3, y: 0 },
                tetromino: TETROMINOS['J'].shape,
                collided: false,
        }

        const playSound = vi.fn();
        const updatePlayerPos = vi.fn();

        dropLogic({ 
            type: 'hard', 
            rows: 11, 
            room: 0,
            score: 0, 
            setLevel: vi.fn(), 
            level: 0,
            gameModeFromState: 'Standard',
            gravity: { standard: 1000 },
            player, 
            stage, 
            setGameOver: vi.fn(),
            setDropTime: vi.fn(),
            hasSubmittedScore: null,
            socket: null, 
            blockHitSoundRef: null, 
            updatePlayerPos, 
            playSound 
        })

        expect(playSound).toHaveBeenCalledTimes(1);
        expect(updatePlayerPos).toHaveBeenCalledTimes(1);
    })

})