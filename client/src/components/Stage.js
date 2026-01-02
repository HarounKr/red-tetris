import React from "react";

import Cell from "./Cell";
import { StyledStage } from "./styles/StyledStage";

const Stage = ({ stage, percentage, border, backgroundColor, isSpectrum, opacity }) => {
    
    const width = stage?.[0]?.length || 0;
    const height = stage?.length || 0;
    
    return (
        <StyledStage width={width} height={height} percentage={percentage} border={border} backgroundColor={backgroundColor} opacity={opacity}>
            {stage?.map(row =>
                row?.map((cell, x) => <Cell key={x} type={cell[0]} isSpectrum={isSpectrum} />)
            )}
        </StyledStage>
    );
};

export default Stage;
