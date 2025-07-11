import { useState } from 'react';
import JanelaChat from './components/JanelaChat';
import BotaoChat from './components/BotaoChat';

function App() {
  const [chatAberto, setChatAberto] = useState(false);

  return (
    <>
      {!chatAberto && <BotaoChat onClick={() => setChatAberto(true)} />}

      {chatAberto && <JanelaChat onFechar={() => setChatAberto(false)} />}
    </>
  );
}

export default App;
