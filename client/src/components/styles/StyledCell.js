import styled from "styled-components";

const StyledCell = styled.div`
  /* La taille vient de la grid (1fr/1fr) => on force un carré */
  width: 100%;
  aspect-ratio: 1 / 1;

  /* Vide = transparent, sinon couleur */
  background: ${({ type, color }) =>
  type === 0 ? "rgba(255, 255, 255, 0.02)" : `rgba(${color}, 0.85)`};

  /* Un léger arrondi donne un rendu plus propre */
  border-radius: ${({ type }) => (type === 0 ? "0" : "4px")};

  /* Bordures uniquement si cellule remplie */
  border: ${({ type }) =>
    type === 0
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "2px solid"};

  border-bottom-color: ${({ type, color }) =>
  type === 0 ? "rgba(255, 255, 255, 0.03)" : `rgba(${color}, 0.12)`};
  border-right-color: ${({ type, color }) =>
  type === 0 ? "rgba(255, 255, 255, 0.08)" : `rgba(${color}, 0.92)`};
  border-top-color: ${({ type, color }) =>
  type === 0 ? "rgba(255, 255, 255, 0.1)" : `rgba(${color}, 0.98)`};
  border-left-color: ${({ type, color }) =>
  type === 0 ? "rgba(255, 255, 255, 0.05)" : `rgba(${color}, 0.45)`};

  /* Petit effet "bloc" + relief, sans trop charger */
  box-shadow: ${({ type, color }) =>
    type === 0
    ? "inset 0 0 4px rgba(255, 255, 255, 0.04)"
      : `
        inset 0 0 8px rgba(${color}, 0.22),
        inset -2px -2px 6px rgba(0, 0, 0, 0.18),
        0 0 4px rgba(0, 0, 0, 0.40)
      `};

  /* Optionnel: rend l’animation/refresh plus fluide */
  will-change: background-color, box-shadow, border-color;
`;

export default StyledCell;
