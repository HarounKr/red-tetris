import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Stage from '../../src/components/Stage'
import { createStage } from '../../src/game/gameHelpers'

describe('Stage', () => {
    it('Tester stage est vide', () => {
        
        const stage = []

        const { container } = render(<Stage 
            stage={stage}
            percentage={20}
            border={'2px solid #333'}
            backgroundColor={'#000000ff'}
            isSpectrum={false} />)

    
        expect(container.children[0]).toBeEmptyDOMElement();
    })

    it('Tester stage quand il est plein', () => {
        const stage = createStage(4 , 4)

        const { container } = render(<Stage 
            stage={stage}
            percentage={20}
            border={'2px solid #333'}
            backgroundColor={'#000000ff'}
            isSpectrum={true} />)

        expect(container.children[0]).not.toBeEmptyDOMElement();

    })
})