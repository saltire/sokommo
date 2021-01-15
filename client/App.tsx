import { hot } from 'react-hot-loader/root';

import './App.scss';


interface AppProps {
  headerText: string,
}

function App({ headerText }: AppProps) {
  return (
    <div className='App'>
      <header>
        <h1>{headerText}</h1>
      </header>
      <main>
        Edit <code>App.jsx</code> and save to hot reload your changes.
      </main>
    </div>
  );
}

export default hot(App);
