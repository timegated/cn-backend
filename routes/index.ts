import * as express from 'express';

export const router = express.Router();

import * as answers from './answers';
import * as stream from './stream';
import * as engines from './engines';
import * as jquery from './jquery';
import * as files from './files';
import * as fineTune from './fine-tune';

router.use('/answer', answers.router);
router.use('/stream', stream.router);
router.use('/engines', engines.router);
router.use('/jquery', jquery.router);
router.use('/files', files.router);
router.use('/fine-tune', fineTune.router);