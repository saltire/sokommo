import Router from 'express-promise-router';


const router = Router();

router.get('/message', async (req, res) => {
  res.json({ message: 'A message from the server!' });
});

export default router;
