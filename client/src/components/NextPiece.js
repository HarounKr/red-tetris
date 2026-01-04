import React from 'react';
import { StyledNextPiece } from './styles/StyledNextPiece';
import { TETROMINOS } from '../tetrominos';

const NextPiece = ({ nextShape }) => {
    if (!nextShape) {
        return (
            <StyledNextPiece>
                <div className="title">Next:</div>
                <div className="preview-grid">
                    <div>Loading...</div>
                </div>
            </StyledNextPiece>
        );
    }

    return (
        <StyledNextPiece>
            <div className="title">Next:</div>
            <div className="preview-grid">
                {nextShape.map((row, y) => (
                    <div key={y} className="preview-row">
                        {row.map((cell, x) => (
                            <div
                                key={x}
                                className={`preview-cell ${cell !== 0 ? 'filled' : ''}`}
                                style={{
                                    backgroundColor: cell !== 0 ? TETROMINOS[cell].color : 'transparent'
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </StyledNextPiece>
    );
};

export default NextPiece;
