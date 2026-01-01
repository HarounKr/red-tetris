import Tetris from './components/Tetris';

const App = ({ socket, selectedGravity }) => {
  return (
    <div className="App">
      <Tetris socket={socket} selectedGravity={selectedGravity} />
    </div>
  );
}

export default App;
