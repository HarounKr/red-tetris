import styled from "styled-components";

const StyledCell = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: ${(props) =>
    props.type === 0 ? "rgba(255, 255, 255, 0.05)" : `rgba(${props.color}, 0.85)`};
  border-radius: ${(props) =>
    props.$isSpectrum ? "0" : props.type === 0 ? "0" : "4px"};
  border: ${(props) =>
    props.$isSpectrum
      ? "none"
      : props.type === 0
      ? "1px solid rgba(255, 255, 255, 0.08)"
      : `2px solid rgba(${props.color}, 0.35)`};

  /* Vide = transparent, penalty = gris foncé, sinon couleur */
  background: ${({ type, color }) =>
  type === 0
    ? "rgba(255, 255, 255, 0.02)"
    : type === "P"
      ? "linear-gradient(135deg, rgba(80, 80, 80, 0.95) 0%, rgba(50, 50, 50, 0.95) 100%)"
      : `rgba(${color}, 0.85)`};

  /* Un léger arrondi donne un rendu plus propre */
  border-radius: ${({ type }) => (type === 0 ? "0" : "4px")};

  /* Bordures uniquement si cellule remplie */
  border: ${({ type }) =>
    type === 0
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "2px solid"};

  border-bottom-color: ${({ type, color }) =>
  type === 0
    ? "rgba(255, 255, 255, 0.03)"
    : type === "P"
      ? "rgba(30, 30, 30, 0.9)"
      : `rgba(${color}, 0.12)`};
  border-right-color: ${({ type, color }) =>
  type === 0
    ? "rgba(255, 255, 255, 0.08)"
    : type === "P"
      ? "rgba(40, 40, 40, 0.9)"
      : `rgba(${color}, 0.92)`};
  border-top-color: ${({ type, color }) =>
  type === 0
    ? "rgba(255, 255, 255, 0.1)"
    : type === "P"
      ? "rgba(120, 120, 120, 0.9)"
      : `rgba(${color}, 0.98)`};
  border-left-color: ${({ type, color }) =>
  type === 0
    ? "rgba(255, 255, 255, 0.05)"
    : type === "P"
      ? "rgba(100, 100, 100, 0.9)"
      : `rgba(${color}, 0.45)`};

  /* Petit effet "bloc" + relief, sans trop charger */
  box-shadow: ${({ type, color }) =>
    type === 0
      ? "inset 0 0 4px rgba(255, 255, 255, 0.04)"
    : type === "P"
      ? `
          inset 2px 2px 4px rgba(100, 100, 100, 0.3),
          inset -2px -2px 4px rgba(0, 0, 0, 0.5),
          0 0 6px rgba(0, 0, 0, 0.6)
        `
      : `
          inset 0 0 8px rgba(${color}, 0.22),
          inset -2px -2px 6px rgba(0, 0, 0, 0.18),
          0 0 4px rgba(0, 0, 0, 0.40)
        `};

  /* Optionnel: rend l'animation/refresh plus fluide */
  will-change: background-color, box-shadow, border-color;
`;

export default StyledCell;
