import styled from "styled-components";

export const StyledStage = styled.div`
  display: grid;

  grid-template-columns: repeat(${(props) => props.width}, 1fr);
  grid-template-rows: repeat(${(props) => props.height}, 1fr);

  gap: 1px;
  border: 2px solid #333;

  width: 100%;
  max-width: 15vw;

  aspect-ratio: ${(props) => `${props.width} / ${props.height}`};

  background: #111;
`;