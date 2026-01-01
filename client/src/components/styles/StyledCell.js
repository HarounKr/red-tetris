import styled from "styled-components";

const StyledCell = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: ${(props) =>
    props.type === 0 ? "rgba(255, 255, 255, 0.05)" : `rgba(${props.color}, 0.85)`};
  border-radius: ${(props) =>
    props.isSpectrum ? "0" : props.type === 0 ? "0" : "4px"};
  border: ${(props) =>
    props.isSpectrum
      ? "none"
      : props.type === 0
      ? "1px solid rgba(255, 255, 255, 0.08)"
      : `2px solid rgba(${props.color}, 0.35)`};

  box-shadow: ${(props) =>
    props.isSpectrum
      ? "none"
      : props.type === 0
      ? "inset 0 0 2px rgba(255, 255, 255, 0.1)"
      : "0 2px 6px rgba(0, 0, 0, 0.35)"};
`;

export default StyledCell;
