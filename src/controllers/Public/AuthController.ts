import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from 'http-status-codes';
import { transformAll } from '@overgear/yup-ast';
import { makeError, makeResponse } from '@shared/functions';
import User from '@models/User';
import { ValidationError } from 'yup';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// Init shared
const router = Router();


const registerValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            'first_name': [['yup.string'], ['yup.min', 3]],
            'last_name': [['yup.string'], ['yup.min', 3]],
            'email': [['yup.string'], ['yup.email'], ['yup.required']],
            'password': [['yup.string'], ['yup.required'], ['yup.min', 6]],
            'username': [['yup.string'], ['yup.required'], ['yup.min', 5]]
        },
    ],
];

router.post('/register', async (req: Request, res: Response) => {
    const validatedData = await transformAll(registerValidationAst).validate(req.body);

    const userWithSameEmail = await User.query()
        .where('email', '=', validatedData.email)
        .first();

    if (userWithSameEmail) {
        throw new ValidationError(['Email already exits'], validatedData, 'email', null);
    }

    const userWithUserName = await User.query()
        .where('username', '=', validatedData.username)
        .first();

    if (userWithUserName) {
        throw new ValidationError(['username already exits'], validatedData, 'username', null);
    }


    validatedData.password = await User.hashAndSaltPassword(validatedData.password);

    if (!validatedData.first_name && !validatedData.last_name) {
        validatedData.stay_anon = true;
    }

    const newUser = await User.query().insert(validatedData).returning('*');;
    return res.status(CREATED).json(makeResponse(newUser)).end();
});


const loginValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            'username': [['yup.string'], ['yup.required'], ['yup.min', 5]],
            'password': [['yup.string'], ['yup.required'], ['yup.min', 6]]
        },
    ],
];

passport.use(new LocalStrategy(
    async (username, password, done) => {
        await transformAll(loginValidationAst)
            .validate({ username, password })
            .catch(e => done(e));

        const user = await User.query().where('username', username).first();
        if (!user) {
            const v = new ValidationError(['User with username does not exist'],
                { username, password },
                'username', null);
            return done(v);
        }

        if (!await user.isMatchPassword(password)) {
            const v = new ValidationError(['Invalid Password'],
                { username, password },
                'password', null);
            return done(v);
        }

        return done(null, user);
    }
));

router.post('/login', passport.authenticate('local', { session: false, failWithError: true }),
    async (req: any, res: Response) => {
        return res.status(OK).json(makeResponse({
            'token': await req.user.generateGwtToken()
        }));
    });



/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
