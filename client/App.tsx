import { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import axios from 'axios';

import './App.scss';


interface AppProps {
  headerText: string,
}

function App({ headerText }: AppProps) {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    axios.get('/api/message')
      .then(({ data }) => setMessage(data.message))
      .catch(console.error);
  }, []);

  return (
    <div className='App'>
      <header>
        <h1>{headerText}</h1>
      </header>
      <main>
        <p>Edit <code>App.tsx</code> and save to hot reload your changes.</p>

        <p>{message}</p>
      </main>
    </div>
  );
}

export default hot(App);
