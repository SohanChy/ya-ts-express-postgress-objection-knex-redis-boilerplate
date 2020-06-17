import { Router } from 'express';
import jwtVerificationMiddleware from '../middlewares/jwtVerificationMiddleware';
import AuthController from '@controllers/Public/AuthController';
import UsersController from '@controllers/AuthGuarded/UsersController';
import UsersPostsController from '@controllers/AuthGuarded/PostsController'
import PostsController from '@controllers/Public/PostsController'
import UserImageUploadController from '@controllers/AuthGuarded/ImageUploadController'
import UserMemeTemplatesController from '@controllers/AuthGuarded/MemeTemplatesController'
import UserMemeHistoryController from '@controllers/AuthGuarded/MemeHistoryController'
import { makeResponse } from '@shared/functions';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/ping', (req, res) => { res.json(makeResponse('PONG')) });

router.use('/auth', AuthController);
router.use('/posts', PostsController);
router.use('/u', authRoutes());


// All routes defined in this function needs to be authenticated via token
function authRoutes() {
    const authRouter = Router();
    authRouter.use(jwtVerificationMiddleware);

    authRouter.use('/users', UsersController);
    authRouter.use('/posts', UsersPostsController);
    authRouter.use('/images', UserImageUploadController);
    authRouter.use('/meme-templates', UserMemeTemplatesController);
    authRouter.use('/meme-history', UserMemeHistoryController);

    return authRouter;
}

// Export the base-router
export default router;