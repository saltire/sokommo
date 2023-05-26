import { useState } from 'react';

import './Login.scss';
import { PlayerData } from '../server/lib/sokoServer';


const colors = ['f94144', 'f3722c', 'f8961e', 'f9c74f', '90be6d', '43aa8b', '577590', '000000'];

type LoginProps = {
  onLogin: (data: PlayerData) => void,
};

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(() => colors[Math.floor(Math.random() * colors.length)]);

  return (
    <div className='Login'>
      <p>Welcome!</p>

      <p>
        <input
          type='text'
          placeholder='Enter your name'
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </p>

      <p className='colors'>
        {colors.map(c => (
          <button
            key={c}
            type='button'
            className={c === color ? 'selected' : undefined}
            style={{ backgroundColor: `#${c}` }}
            onClick={() => setColor(c)}
          />
        ))}
      </p>

      <p>
        <button type='button' disabled={!name.trim()} onClick={() => onLogin({ name, color })}>
          Log in
        </button>
      </p>
    </div>
  );
}
