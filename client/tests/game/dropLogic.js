import { describe, expect, it, vi } from 'vitest'

describe('dropLogic', () => {
    it('Tester que les fonctions de mise à jour du temps et du niveau sont bien appelés', () => {

        const setDropTime = vi.fn();
        const setLevel = vi.fn();

        dropLogic = ({ 
            type: 'soft', 
            rows: 11, 
            room,
            score, 
            setLevel, 
            level: 0, 
            gameModeFromState: 'Standard',
            gravity, 
            player, 
            stage, 
            setGameOver,
            setDropTime,
            hasSubmittedScore,
            socket, 
            blockHitSoundRef, 
            updatePlayerPos, 
            playSound })
        
    })
    
})