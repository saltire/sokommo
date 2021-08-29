import Router from 'express-promise-router';

import api from './api';
import client from './client';


const router = Router();

router.use('/api', api);
router.use('/', client);

export default router;
