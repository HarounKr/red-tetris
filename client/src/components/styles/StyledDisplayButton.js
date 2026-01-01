import styled from "styled-components";

export const StyledDisplayButton = styled.div` 
    box-sizing: border-box;
    margin: 0 0 20px 0;
    padding: 20px;
    min-height: 30px;
    width: 100%;
    border-radius: 20px;
    border: none;
    color: white;
    background: #333;
    font-size: 0.8rem;
    text-align: center;
    cursor: pointer;
    outline: none;
    &:hover {
        background: #555;
    }
`;