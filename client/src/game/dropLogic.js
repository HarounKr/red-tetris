import { checkCollision } from "./gameHelpers";

export const dropLogic = ({ type, rows, room, score, setLevel, level, gameModeFromState, gravity, player, stage, setGameOver, setDropTime, hasSubmittedScore, socket, blockHitSoundRef, updatePlayerPos, playSound, lockDelayMs, lockStartRef }) => {
    if (type === 'soft' && rows > (level + 1) * 10) {
        setLevel(prev => prev + 1);
        if (gameModeFromState !== 'Rabbit') {
            const baseSpeed = gravity[gameModeFromState] || gravity.Standard;
            setDropTime(Math.max(100, baseSpeed - (level + 1) * 100));
        }
    }
    let y = 1;

    if (type === 'hard') {
        let newY = player.pos.y;
        while (!checkCollision(player, stage, { x: 0, y: newY - player.pos.y + 1 })) {
            newY++;
        }
        y = newY - player.pos.y;
        
    }

    if (!checkCollision(player, stage, { x: 0, y: y })) {
        if (lockStartRef) {
            lockStartRef.current = null;
        }
        if (type === 'hard') {
            playSound(blockHitSoundRef);
            updatePlayerPos({ x: 0, y: y, collided: true });
        }
        else
            updatePlayerPos({ x: 0, y: y, collided: false });
    } else {
        if (player.pos.y <= 1) {
            setGameOver(true);
            setDropTime(null);
            
            if (!hasSubmittedScore.current) {
                hasSubmittedScore.current = true;
                socket.emit("game_over", {
                    socketId: socket.id,
                    room,
                    score,
                    rows,
                    level
                });
            }
            return;
        }

        if (type === 'hard') {
            playSound(blockHitSoundRef);
            updatePlayerPos({ x: 0, y: 0, collided: true });
            return;
        }

        if (!lockStartRef) {
            return;
        }
        if (lockStartRef.current === null) {
            lockStartRef.current = Date.now();
            return;
        }
        const elapsed = Date.now() - lockStartRef.current;
        if (elapsed >= lockDelayMs) {
            playSound(blockHitSoundRef);
            updatePlayerPos({ x: 0, y: 0, collided: true });
            lockStartRef.current = null;
        }
    }
}
