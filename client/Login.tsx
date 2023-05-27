import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import './Login.scss';
import { PlayerData } from '../server/rooms/SokoRoom';
import { DiscordUser } from '../server/routes/api';


const colors = ['f94144', 'f3722c', 'f8961e', 'f9c74f', '90be6d', '43aa8b', '577590', '333333'];

type LoginProps = {
  onLogin: (data: PlayerData) => void,
};

export default function Login({ onLogin }: LoginProps) {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(() => colors[Math.floor(Math.random() * colors.length)]);
  const [user, setUser] = useState<DiscordUser | undefined>(undefined);

  useEffect(() => {
    if (loaded) {
      return;
    }

    axios.get<{ discordUser?: DiscordUser, playerData?: Partial<PlayerData> }>('/api/player')
      .then(({ data }) => {
        const { playerData, discordUser } = data;
        const defaultName = playerData?.name || discordUser?.username;
        if (defaultName) {
          setName(defaultName);
        }
        if (playerData?.color) {
          setColor(playerData.color);
        }

        if (data.discordUser) {
          setUser(data.discordUser);
        }

        setLoaded(true);
      })
      .catch(err => console.error('Error getting player data:', err));
  }, []);

  const login = useCallback(() => {
    axios.post('/api/player', { name, color })
      .catch(err => console.error('Error saving player data:', err));

    onLogin({ name, color, imageUrl: user?.imageUrl });
  }, [name, color, user]);

  return (
    <div className='Login'>
      <div className='pretitle'>Everybody knows... a little place like</div>
      <div className='title'>SokoMMO</div>

      {!loaded ? <p>Loading...</p> : (
        <>
          <div className='discord'>
            {user ? (
              <>
                <p className='discord-user'>
                  <span>Logged in as: </span>
                  {user.imageUrl && <img src={user.imageUrl} alt={user.username} />}
                  <strong>{user.username}</strong>
                </p>
                <p><a href='/auth/logout'>Log out of Discord</a></p>
              </>
            ) : (
              <p><a href='/auth/login'>Log in to Discord</a></p>
            )}
          </div>

          <p>
            Your display name:<br />
            <input
              type='text'
              placeholder='Enter your name'
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </p>

          <p className='colors'>
            Pick a color:<br />
            {colors.map(c => (
              <button
                key={c}
                type='button'
                title={`Color ${c + 1}`}
                className={c === color ? 'selected' : undefined}
                style={{ backgroundColor: `#${c}` }}
                onClick={() => setColor(c)}
              >
                {' '}
              </button>
            ))}
          </p>

          <p>
            <button
              type='button'
              className='play'
              style={{ color: `#${color}` }}
              disabled={!name.trim()}
              onClick={login}
            >
              Play!
            </button>
          </p>
        </>
      )}
    </div>
  );
}
