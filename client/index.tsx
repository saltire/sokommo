import { createRoot } from 'react-dom/client';

import './index.scss';
import App from './App';


createRoot(document.querySelector('#root')!)
  .render(<App />);
