import { APIUser } from 'discord-api-types/v10';
import Router from 'express-promise-router';

import { DiscordAuth } from './auth';
import callApi from '../lib/discordApi';
import { PlayerData } from '../rooms/SokoRoom';


const router = Router();
export default router;

declare module 'express-session' {
  interface SessionData {
    discordAuth?: DiscordAuth,
    playerData?: PlayerData,
  }
}

export type DiscordUser = {
  id: string,
  username: string,
  discriminator: string,
  imageUrl?: string,
};

router.get('/player', async (req, res) => {
  const { discordAuth, playerData } = req.session;

  const discordUser = !discordAuth || discordAuth.expiresAt.valueOf() - Date.now() < 30 ? null : (
    await callApi<APIUser>('users/@me', { token: discordAuth.accessToken })
      .then(user => ({
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        imageUrl: user.avatar && `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      })));

  res.json({
    discordUser,
    playerData,
  });
});

router.post('/player', async (req, res) => {
  req.session.playerData = req.body;
  res.sendStatus(204);
});
