import styled from "styled-components";

export const StyledStage = styled.div`
    display:grid;
    grid-template-rows: repeat(${props => props.$height}, calc(${props => props.$percentage}vw / ${props => props.$width}));
    grid-template-columns: repeat(${props => props.$width}, 1fr);
    width: fit-content;
    height: fit-content;
    border: ${props => props.$border};
    background-color: ${props => props.$backgroundColor};
    margin: 0 auto;
    opacity: ${(props) => props.$opacity ? props.$opacity : 1};
`
