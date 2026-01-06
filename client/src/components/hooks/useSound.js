import { useEffect, useRef } from 'react'
import dropBlock from '../../assets/drop-block.wav';
import blockHit from '../../assets/game-block-hit.wav';
import childGameOver from '../../assets/child-game-over.wav'

export const useSound = (sound) => {
    const dropSoundRef = useRef();
    const blockHitSoundRef = useRef();
    const gameOverSoundRef = useRef();

    useEffect(( ) => {
        dropSoundRef.current = new Audio(dropBlock);
        blockHitSoundRef.current = new Audio(blockHit);
        gameOverSoundRef.current = new Audio(childGameOver);

        [dropSoundRef, blockHitSoundRef, gameOverSoundRef].forEach((ref) => {
            if (ref.current)
                ref.current.preload = 'auto';
        })
    }, [])

    const playSound = (audioRef) => {
        if (sound && audioRef) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    }

    return [dropSoundRef, blockHitSoundRef, gameOverSoundRef, playSound]

}