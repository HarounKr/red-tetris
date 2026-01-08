import React from 'react';
import styled from 'styled-components';

const StyledScoreboard = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    border: 3px solid #fff;
    border-radius: 20px;
    padding: 30px 40px;
    z-index: 1000;
    min-width: 400px;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);

    h2 {
        color: #fff;
        text-align: center;
        font-size: 2rem;
        margin-bottom: 25px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .winner-banner {
        text-align: center;
        font-size: 1.5rem;
        margin-bottom: 20px;
        padding: 10px;
        border-radius: 10px;
        
        &.win {
            color: #4caf50;
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4caf50;
        }
        
        &.lose {
            color: #f44336;
            background: rgba(244, 67, 54, 0.2);
            border: 2px solid #f44336;
        }
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;

    th, td {
        padding: 12px 15px;
        text-align: left;
        color: #fff;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    th {
        background: rgba(255, 255, 255, 0.1);
        font-size: 1rem;
        text-transform: uppercase;
    }

    td {
        font-size: 1.1rem;
    }

    tr:nth-child(even) {
        background: rgba(255, 255, 255, 0.05);
    }

    tr.winner {
        background: rgba(76, 175, 80, 0.2);
        td {
            color: #4caf50;
            font-weight: bold;
        }
    }

    tr.loser {
        background: rgba(244, 67, 54, 0.1);
        td {
            color: #f44336;
        }
    }

    .rank {
        font-weight: bold;
        font-size: 1.2rem;
    }

    .rank-1 { color: gold; }
    .rank-2 { color: silver; }
    .rank-3 { color: #cd7f32; }
`;

const StyledButton = styled.button`
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, rgb(255, 0, 0) 0%, rgb(227, 149, 149) 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Press Start 2P', monospace;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
    }

    &.restart {
        background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
        
        &:hover {
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Scoreboard = ({ scores, mySocketId, onClose, onRestart, isOwner }) => {
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    
    const amIWinner = sortedScores.length > 0 && sortedScores[0].socketId === mySocketId;

    return (
        <StyledScoreboard>
            <h2>Tableau des Scores</h2>
            
            <div data-testid='winner-banner-test' className={`winner-banner ${amIWinner ? 'win' : 'lose'}`}>
                {amIWinner ? 'Vous avez gagné !' : 'Vous avez perdu !'}
            </div>

            <StyledTable>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Joueur</th>
                        <th>Score</th>
                        <th>Lignes</th>
                        <th>Level</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedScores.map((player, index) => (
                        <tr 
                            key={player.socketId} 
                            className={index === 0 ? 'winner' : 'loser'}
                        >
                            <td className={`rank rank-${index + 1}`}>{index + 1}</td>
                            <td>
                                {player.name} 
                                {player.socketId === mySocketId && ' (vous)'}
                            </td>
                            <td>{player.score}</td>
                            <td>{player.rows}</td>
                            <td>{player.level}</td>
                        </tr>
                    ))}
                </tbody>
            </StyledTable>

            <ButtonGroup>
                {isOwner && (
                    <StyledButton className="restart" onClick={onRestart}>
                        Rejouer
                    </StyledButton>
                )}
                <StyledButton onClick={onClose}>
                    Retour au Lobby
                </StyledButton>
            </ButtonGroup>
        </StyledScoreboard>
    );
};

export default Scoreboard;
