import cookieParser from 'cookie-parser';

import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST, UNPROCESSABLE_ENTITY, NOT_FOUND } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';

import { Model } from 'objection';
import knex from './db/bootstrap';
import { makeError, makeValidationError, makeResponse } from '@shared/functions';
import { ValidationError } from 'yup';
import { NotFoundError } from '@shared/exceptions';
import passport from 'passport';
import proxy from 'express-http-proxy';

// Init express
const app = express();

/************************************************************************************
 * Generic HTTP get proxy for gcloud storage if its blocked for target users
 ***********************************************************************************/
// app.get('/gcsp/:bucketName/*', proxy('https://storage.googleapis.com',
//     {
//         proxyReqPathResolver(req) {
//             if (
//                 !['deshimemes-file-storage'].includes(req.params.bucketName)
//                 || !req.params[0]
//             ) {
//                 throw new Error('Invalid Request');
//             }
//             return `/${req.params.bucketName}/${req.params[0]}`;
//         }
//     }
// ));


/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Setup ORM
Model.knex(knex);

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
// app.use('/', (req, res) => { res.json(makeResponse('PONG')) });
app.use('/api', BaseRouter);


/************************************************************************************
 *                              Serve front-end content
 * It is recommended to remove this section and use separate frontend
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html', { root: viewsDir });
});

// Print errors
app.use((req, res, next) => {
    throw new NotFoundError(`${req.method}:${req.url}`)
})
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);

    if (err instanceof ValidationError || err.name === 'ValidationError' || err.name === 'MulterError') {
        return res.status(UNPROCESSABLE_ENTITY).json(makeValidationError(err));
    }
    else if (err instanceof NotFoundError) {
        return res.status(NOT_FOUND).json(makeError(err.message));
    }

    return res.status(BAD_REQUEST).json(makeError(err.message, err));
});



// Export express instance
export default app;
