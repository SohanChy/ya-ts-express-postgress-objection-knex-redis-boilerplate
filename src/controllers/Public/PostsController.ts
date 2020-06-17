import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from 'http-status-codes';
import { transformAll } from '@overgear/yup-ast';

import { makeError, makeResponse } from '@shared/functions'
import User from '@models/User'
import { ValidationError } from 'yup'
import { get as _get, isEmpty as _isEmpty } from 'lodash'
import { getAuthUser, getGCSPUrl } from '@shared/accessors';
import { NotFoundError } from '@shared/exceptions';
import Post from '@models/Post';
import Reaction from '@models/Reaction';

// Init shared
const router = Router();

router.get('/', async (req, res) => {

    const posts = await Post.getRankedPosts();

    const rows = posts.rows.map(post => {
        return {
            'uid': post.uid,
            'image_url': getGCSPUrl(post.image_url),
            'text': post.text,
            'by_username': post.by_username
        }
    });

    return res.status(OK).json(makeResponse(rows)).end();
});


const searchValidationAst = [
    ['yup.object'],
    ['yup.required'],
    [
        'yup.shape',
        {
            's': [['yup.string'], ['yup.required'], ['yup.min', 5]]
        },
    ],
];
router.get('/search', async (req, res) => {
    const validatedData = await transformAll(searchValidationAst).validate(req.query);
    const posts = await Post.query().where('text', 'ilike', `%${req.query.s}%`).limit(5);
    return res.status(OK).json(makeResponse(posts)).end();
});


router.get('/:uid', async (req, res) => {
    const postUid: string = req.params.uid;
    const post: Post = await Post.queryWithLikes().where('uid', postUid).first();
    if (!post) {
        throw new NotFoundError(`Post with uid:${postUid}`);
    }

    return res.status(OK).json(makeResponse(post)).end();
});


/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
