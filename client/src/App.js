import Tetris from './components/Tetris';

const App = ({ socket }) => {
  return (
    <div className="App">
      <Tetris socket={socket} />
    </div>
  );
}

export default App;
