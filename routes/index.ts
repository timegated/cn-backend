import * as express from 'express';

export const router = express.Router();

import * as answers from './answers';
import * as stream from './stream';
import * as engines from './engines';

router.use('/answer', answers.router);
router.use('/stream', stream.router);
router.use('/engines', engines.router);