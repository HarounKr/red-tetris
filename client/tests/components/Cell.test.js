import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Cell from '../../src/components/Cell'

describe('Cell', () => {
    it('Tester la couleur lorsque qu aucun type de Tetrominos n est defini', () => {
        
        render(<Cell type={null} isSpectrum={false} />)
        screen.debug();

        const cell = screen.getByTestId('test-cell');
        expect(cell).toHaveStyle('background: rgba(0, 0, 0, 0.85)');
    })
})