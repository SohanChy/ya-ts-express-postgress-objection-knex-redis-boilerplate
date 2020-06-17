import jwt from 'jsonwebtoken'
import { UNAUTHORIZED } from 'http-status-codes'
import { makeError } from '@shared/functions';
import { get_env } from '@shared/loadEnv';
import User from '@models/User';

export default function jwtVerificationMiddleware(req, res, next) {
    const tokenString = req.get('Authorization');
    if (!tokenString) {
        return res.status(UNAUTHORIZED)
            .json(makeError('Authorization token not found'))
            .end();
    }

    const token = tokenString.split(' ', 2)[1];

    jwt.verify(token, get_env('secrets.jwt'), (err, decoded) => {
        if (err) {
            return res.status(UNAUTHORIZED)
                .json(makeError('Authorization token invalid', err.message))
                .end();
        }

        req.authDecodedToken = decoded;
        next();
    });
}