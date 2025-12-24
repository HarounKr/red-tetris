import styled from "styled-components";

export const StyledStage = styled.div`
    display:grid;
    grid-template-rows: repeat(${props => props.height}, calc(20vw / ${props => props.width}));
    grid-template-columns: repeat(${props => props.width}, 1fr);
    width: fit-content;
    height: fit-content;
    border: 2px solid #333;
    background-color: #111;
    margin: 0 auto;
`