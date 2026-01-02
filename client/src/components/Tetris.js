import React, { useState, useEffect, useMemo } from 'react';

import Stage from './Stage';
import Display from './Display';
import LeaveButtons from './LeaveButtons';
import { createStage, checkCollision, STAGE_HEIGHT, STAGE_WIDTH } from '../gameHelpers';
import { useStage } from './hooks/useStage';
import { usePlayer } from './hooks/usePlayer';
import { useInterval } from './hooks/useInterval';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { useGameStatus } from './hooks/useGameStatus';
import { randomTetromino } from '../tetrominos';
import Spectrums from './Spectrums';


const Tetris = (selectedGravity) => {

    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState(null);
    const [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate] = usePlayer(null);
    const [stage, setStage, rowsCleared, drawPlayersSpectrums, drawNextTetrominoShape] = useStage(player, resetPlayer, gameOver);
    const [level, setLevel, rows, setRows, score, setScore] = useGameStatus(rowsCleared);
    const [playersSpectrums, setPlayersSpectrums] = useState();
    const [nextTetrominoShape, setNextTetrominoShape] = useState();
    const [otherPlayers, setOtherPlayers] = useState([
        {
            name: 'guest1',
            pos: { x: 4, y: 1 },
            score: 1,
            tetromino: randomTetromino().shape,
            collided: false,
        }, 
        {
            name: 'guest2',
            pos: { x: 4, y: 5 },
            score: 3,
            tetromino: randomTetromino().shape,
            collided: false,
        }

    ]);


    const gravity = useMemo(() => ({
        Turtle: 2000,
        Standard: 1000,
        Fast: 100,
    }), [])
       
    
    const movePlayer = dir => {
        //move player
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    useEffect(() => {
        setStage(createStage(STAGE_HEIGHT, STAGE_WIDTH));
        const initialDrop = gravity[selectedGravity] || gravity.Standard;
        console.log(initialDrop)
        setDropTime(initialDrop);
        resetPlayer();
        setScore(0);
        setRows(0);
        setLevel(0);
    }, []);

    useEffect(() => {
        const players = []

        for (let i = 0; i < otherPlayers.length; i++) {
            const playerSpectrum = drawPlayersSpectrums(otherPlayers[i]);
            players.push({ 
                player: otherPlayers[i],
                spectrum: playerSpectrum,
            })
        }
        setPlayersSpectrums(players);
    }, [otherPlayers]);

    useEffect(() => {
        setNextTetrominoShape(drawNextTetrominoShape(nextRandomShape));

        console.log()

    }, [nextRandomShape])

    useEffect(() => {
        console.log("nextTetrominoShape : ", nextTetrominoShape);
    }, [nextTetrominoShape])

    const leaveGame = () => {
        //leave game
        
    };

    const drop = () => {
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            setDropTime(dropTime / (level + 1) + 200);
        }
        //drop tetromino
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Game over
            if (player.pos.y <= 1) {
                setGameOver(true);
                setDropTime(null);
                return;
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    const dropPlayer = () => {
        drop();
    };

    const moove = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) {
                // left arrow
                movePlayer(-1);
            } else if (keyCode === 39) {
                // right arrow
                movePlayer(1);
            } else if (keyCode === 40) {
                // down arrow
                dropPlayer();
            } else if (keyCode === 38) {
                // up arrow
                playerRotate(stage, 1); 
            }
        }
    };

    useInterval(() => {
            drop();
    }, dropTime);

    return (
        <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => moove(e)}>
            <StyledTetris>
                <div className='left-side'>
                    <Spectrums playersSpectrums={playersSpectrums} />
                </div>
                <Stage stage={stage} percentage={20} border={'2px solid #333'} backgroundColor={'#000000ff'} isSpectrum={false} />
                <div className='right-side'>
                    {gameOver ? (
                        <Display gameOver={gameOver} text="Game Over" />
                    ) : (
                        <>
                            
                                <Display text={"Score " + score}/>
                                <Display text={"Rows " + rows} />
                                <Display text={"Level " + level } />
                            
                            <Stage stage={nextTetrominoShape} percentage={4.5} border={'2px solid #333'} backgroundColor={'#000000ff'} isSpectrum={false} />
                            <LeaveButtons callback={leaveGame}/>
                        </>
                   )}
                   
                </div>
            </StyledTetris>
        </StyledTetrisWrapper>
    );
}

export default Tetris;
