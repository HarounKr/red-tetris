import Tetris from './components/Tetris';

const App = ({ socket }) => {
  console.log('App component rendered with socket:', socket);
  socket.on("connect", () => {
    console.log(socket.id);
  });
  return (
    <div className="App">
      <Tetris socket={socket} />
    </div>
  );
}

export default App;
