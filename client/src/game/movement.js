import { checkCollision } from "./gameHelpers";


const movePlayer = (dir, player, stage, dropSoundRef, playSound, updatePlayerPos) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
    
        playSound(dropSoundRef);
        updatePlayerPos({ x: dir, y: 0 });
    }
};

export const handleKeyDown = ({e, gameOver, player, stage, dropSoundRef, playerRotate, drop, hardDrop, playSound, updatePlayerPos}) => {
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }

    if (!gameOver) {
        if (e.keyCode === 37) {
            movePlayer(-1, player, stage, dropSoundRef, playSound, updatePlayerPos);
        } else if (e.keyCode === 39) {
            movePlayer(1, player, stage, dropSoundRef, playSound, updatePlayerPos);
        } else if (e.keyCode === 40) {
         
            playSound(dropSoundRef)
            drop();
        } else if (e.keyCode === 38) {
            
            playerRotate(stage, 1);
        } else if (e.keyCode === 32) {
        
            hardDrop();
        }
    }
};
