import React, { useState, useEffect, useMemo, useRef } from 'react';

import Stage from './Stage';
import Display from './Display';
import LeaveButtons from './LeaveButtons';
import Scoreboard from './Scoreboard';
import { createStage, checkCollision, createNextPieceStage } from '../gameHelpers';
import { useStage } from './hooks/useStage';
import { usePlayer } from './hooks/usePlayer';
import { useInterval } from './hooks/useInterval';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { useGameStatus } from './hooks/useGameStatus';
import { useParams, useNavigate } from "react-router";

const Tetris = ({ socket, selectedGravity }) => {
    const { room } = useParams();
    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState(null);
    const [player, updatePlayerPos, resetPlayer, nextRandomShape, playerRotate] = usePlayer(null);
    const [stage, setStage, rowsCleared] = useStage(player, resetPlayer, gameOver);
    const [level, setLevel, rows, setRows, score, setScore] = useGameStatus(rowsCleared, socket, room);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [finalScores, setFinalScores] = useState([]);
    const [isOwner, setIsOwner] = useState(false);

    const hasSubmittedScore = useRef(false);

    const currentScoreRef = useRef(0);
    const currentRowsRef = useRef(0);
    const currentLevelRef = useRef(0);

    const [nextPieceStage, setNextPieceStage] = useState(createNextPieceStage());
    const navigate = useNavigate();

    useEffect(() => {
        if (socket && room) {
            socket.emit("join_game_room", { room, socketId: socket.id });
        }

        return () => {
            if (socket && room) {
                socket.emit("leave_game_room", { room, socketId: socket.id });
            }
        };
    }, [socket, room]);


    const gravity = useMemo(() => ({
        Turtle: 2000,
        Standard: 1000,
        Fast: 100,
    }), [])

    useEffect(() => {
        currentScoreRef.current = score;
        currentRowsRef.current = rows;
        currentLevelRef.current = level;
    }, [score, rows, level]);

    
    const movePlayer = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    useEffect(() => {
        setStage(createStage());
        const initialDrop = gravity[selectedGravity] || gravity.Standard;
        setDropTime(initialDrop);
        resetPlayer();
        setScore(0);
        setRows(0);
        setLevel(0);
    }, []);



    const leaveGame = () => {
        if (room && socket && socket.connected) {
            socket.emit("leave_room", { room, socketId: socket.id });
        }
        setGameOver(true);
        setDropTime(null);
        navigate("/");

    };

    const drop = () => {
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            setDropTime(dropTime / (level + 1) + 200);
        }
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
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
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    useEffect(() => {
        const handleOpponentGameOver = () => {
            setGameOver(true);
            setDropTime(null);

            socket.emit("winner_score", {
                socketId: socket.id,
                room,
                score: currentScoreRef.current,
                rows: currentRowsRef.current,
                level: currentLevelRef.current
            });
        };

        const handleFinalScores = ({ scores }) => {
            setFinalScores(scores);
            setShowScoreboard(true);
        };

        const handlePenaltyRows = ({ penaltyRows, fromPlayer }) => {
            if (fromPlayer === socket.id) {
                return;
            }

            setStage(prevStage => {
                const newPenaltyRows = [];
                for (let i = 0; i < penaltyRows; i++) {
                    const penaltyRow = prevStage[0].map(() => ['P', 'merged']);
                    newPenaltyRows.push(penaltyRow);
                }
                const newStage = [...prevStage.slice(penaltyRows), ...newPenaltyRows];
                return newStage;
            });
        };

        socket.on("opponent_game_over", handleOpponentGameOver);
        socket.on("add_penalty_rows", handlePenaltyRows);
        socket.on("final_scores", handleFinalScores);

        const handleYouAreOwner = ({ owner }) => {
            setIsOwner(owner);
        };

        const handleRestartGame = () => {
            navigate(`/${room}`);
        };

        socket.on("you_are_owner", handleYouAreOwner);
        socket.on("restart_game", handleRestartGame);

        return () => {
            socket.off("opponent_game_over", handleOpponentGameOver);
            socket.off("add_penalty_rows", handlePenaltyRows);
            socket.off("final_scores", handleFinalScores);
            socket.off("you_are_owner", handleYouAreOwner);
            socket.off("restart_game", handleRestartGame);
        };
    }, [socket, setStage, room, navigate]);

    const dropPlayer = () => {
        drop();
    };

    const moove = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) {
                movePlayer(-1);
            } else if (keyCode === 39) {
                movePlayer(1);
            } else if (keyCode === 40) {
                dropPlayer();
            } else if (keyCode === 38) {
                playerRotate(stage, 1); 
            }
        }
    };

    useInterval(() => {
            drop();
    }, dropTime);

    const handleCloseScoreboard = () => {
        setShowScoreboard(false);
        navigate("/");
    };

    const handleRestart = () => {
        socket.emit("restart_game", { room });
    };

    return (
        <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => moove(e)}>
            <StyledTetris>
                <Stage stage={stage} percentage={20} />
                <aside>
                    {gameOver ? (
                        <Display gameOver={gameOver} text="Game Over" />
                    ) : (
                        <>
                            <div>
                                <Display text={"Score " + score}/>
                                <Display text={"Rows " + rows} />
                                <Display text={"Level " + level } />
                            </div>
                            <LeaveButtons callback={leaveGame}/> 
                        </>
                   )}
                   
                </aside>
            </StyledTetris>

            {/* Tableau des scores */}
            {showScoreboard && (
                <Scoreboard
                    scores={finalScores}
                    mySocketId={socket.id}
                    onClose={handleCloseScoreboard}
                    onRestart={handleRestart}
                    isOwner={isOwner}
                />
            )}
        </StyledTetrisWrapper>
    );
}

export default Tetris;
