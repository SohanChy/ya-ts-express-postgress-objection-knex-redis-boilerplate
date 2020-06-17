import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { transformAll } from '@overgear/yup-ast';

import { makeError, makeResponse } from '@shared/functions'
import User from '@models/User'
import { ValidationError } from 'yup'
import { get as _get, isEmpty as _isEmpty } from 'lodash'
import { getAuthUser } from '@shared/accessors';
import { NotFoundError } from '@shared/exceptions';
import Post from '@models/Post';
import Reaction from '@models/Reaction';
import namdarNamDao from '@shared/badshahNamdar';

// Init shared
const router = Router();

const createPostValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            'image_url': [['yup.string'], ['yup.required'], ['yup.min', 10]],
            'text': [['yup.string']]
        },
    ],
];

router.post('/', async (req, res) => {
    const validatedData = await transformAll(createPostValidationAst).validate(req.body);
    const user: User = await getAuthUser(req);

    validatedData.uid = namdarNamDao();
    validatedData.by_user_id = user.id;

    const newPost = await Post.query().insert(validatedData).returning('*');
    return res.status(CREATED).json(makeResponse(newPost)).end();
});

const updatePostValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            'id': [['yup.number'], ['yup.required'], ['yup.positive'], ['yup.integer']],
            'text': [['yup.string'], ['yup.required']]
        },
    ],
];
router.patch('/:id', async (req, res) => {

    const validatedData = await transformAll(updatePostValidationAst).validate({
        id: req.params.id,
        text: req.body.text
    });

    const updatedPost = await Post.query().update({ 'text': validatedData.text })
        .where('id', req.params.id)
        .returning('*');
    return res.status(OK).json(makeResponse(updatedPost)).end();
});

const reactValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            'reaction': [['yup.string'], ['yup.required'], ['yup.oneOf', ['upvote', 'downvote']]],
        },
    ],
];

router.post('/:uid/react', async (req, res) => {
    await transformAll(reactValidationAst).validate(req.body);
    const user: User = await getAuthUser(req);
    const postUid: string = req.params.uid;
    const post: Post = await Post.findByUid(postUid);

    if (!post) {
        throw new NotFoundError(`Post with uid:${postUid}`);
    }

    if (req.body.reaction === 'upvote') {
        Reaction.upvotePost(post.id, user.id);
    }
    else if (req.body.reaction === 'downvote') {
        Reaction.downvotePost(post.id, user.id);
    }

    return res.status(OK).json(makeResponse(`done`)).end();
});


/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
