import Stage from "./Stage";


const Spectrums = ({ playersSpectrums }) => {

    return (
        <>
            {playersSpectrums?.map(({ player, spectrum }, index) => (
                <div className='spectrum' key={index}>
                    <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        marginBottom: '5px',
                        textAlign: 'center'
                    }}>
                        Score: {player.score || 0}
                    </div>
                    <Stage
                        stage={spectrum}
                        percentage={3.5}
                        backgroundColor={'#707070ff'}
                        isSpectrum={true}
                        opacity={0.2}
                    />
                    <div style={{
                        fontSize: '1rem',
                        color: player.name === 'You' ? '#00ff00' : '#fff',
                        marginTop: '5px',
                        textAlign: 'center',
                        fontWeight: player.name === 'You' ? 'bold' : 'normal'
                    }}>
                        {player.name}
                    </div>
                </div>
           ))}
        </>
    )

}

export default Spectrums;
