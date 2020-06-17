import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from 'http-status-codes';
import { transformAll } from '@overgear/yup-ast';

import { makeError, makeResponse } from '@shared/functions'
import User from '@models/User'
import { ValidationError } from 'yup'
import { get as _get, isEmpty as _isEmpty } from 'lodash'
import { getAuthUser } from '@shared/accessors';
import { NotFoundError } from 'objection';

// Init shared
const router = Router();

const updateUserValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            'first_name': [['yup.string'], ['yup.min', 3]],
            'last_name': [['yup.string'], ['yup.min', 3]],
            'password': [['yup.string'], ['yup.min', 6]],
        },
    ],
];

router.patch('/', async (req, res) => {
    const validatedData = await transformAll(updateUserValidationAst).validate(req.body);

    if (!validatedData.first_name && !validatedData.last_name && !validatedData.password) {
        throw new ValidationError(['No data sent!'], validatedData, '', null);
    }

    const user: User = await getAuthUser(req);

    user.first_name = validatedData.first_name ? validatedData.first_name : user.first_name;
    user.last_name = validatedData.last_name ? validatedData.last_name : user.last_name;
    user.password = validatedData.password
        ? await User.hashAndSaltPassword(validatedData.password) : user.password;

    const updatedUser = await user.$save();

    return res.status(OK).json(makeResponse(updatedUser)).end();
});



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
