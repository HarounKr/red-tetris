import React from "react";
import StyledCell from "./styles/StyledCell";
import { TETROMINOS } from "../tetrominos";

const Cell = ( { type, isSpectrum }) => {

    const color = isSpectrum
        ? '255, 229, 204'
        : (TETROMINOS[type]?.color || '0, 0, 0')
    return (
        <StyledCell type={type} color={color} $isSpectrum={isSpectrum}>
            
        </StyledCell>
    );
}

export default React.memo(Cell);
