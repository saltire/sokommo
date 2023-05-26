import Router from 'express-promise-router';
import { PlayerData } from '../lib/sokoServer';


const router = Router();
export default router;

declare module 'express-session' {
  interface SessionData {
    playerData?: PlayerData,
  }
}

router.get('/player', async (req, res) => {
  res.json(req.session.playerData || {});
});

router.post('/player', async (req, res) => {
  req.session.playerData = req.body;
  res.sendStatus(204);
});
