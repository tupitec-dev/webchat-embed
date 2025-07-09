import { useState } from 'react';
import BotaoChat from './components/BotaoChat';
import JanelaChat from './components/JanelaChat';

function App() {
  const [chatAberto, setChatAberto] = useState(false);

  return (
    <>
      {chatAberto ? (
        <JanelaChat onFechar={() => setChatAberto(false)} />
      ) : (
        <BotaoChat onClick={() => setChatAberto(true)} />
      )}
    </>
  );
}

export default App;
