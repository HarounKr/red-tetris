import Stage from "./Stage";


const Spectrums = ( {playersSpectrums}) => {

    return (
        <>
           {playersSpectrums?.map(({ player, spectrum }, index) => (
                <div className='spectrum' key={index}>
                    <span>
                        {player.score}
                    </span>
                    <Stage stage={spectrum} percentage={3.5} backgroundColor={'#707070ff'} isSpectrum={true} opacity={0.2}/>
                    <span>
                        {player.name}
                    </span>      
                </div>
           ))}
        </>
    )

}

export default Spectrums;
