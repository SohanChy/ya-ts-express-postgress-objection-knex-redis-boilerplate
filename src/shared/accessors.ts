import { get as _get } from 'lodash';
import User from '@models/User';
import { NotFoundError } from '@shared/exceptions';
import { get_env } from './loadEnv';

export const getUserByUserName = async (userName: string): Promise<User> => {
    // Implement caching here
    return User.query().findOne({
        'username': userName
    });
}

export const getAuthUser = async (req): Promise<User> => {
    const userName = _get(req, 'authDecodedToken.username', null);
    if (!userName) {
        throw new NotFoundError('Username');
    }

    const user = await getUserByUserName(userName);
    if (!user) {
        throw new NotFoundError(`User with username:${userName}`);
    }

    return Promise.resolve(user);
}

export const getGCSPUrl = (gcsFilePath) => {
    return `${get_env('app.host')}/gcsp/${gcsFilePath}`;
}