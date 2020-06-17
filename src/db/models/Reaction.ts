import BaseModel from './BaseModel';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { omit } from 'lodash'
import { get_env } from '@shared/loadEnv';
import { raw } from 'objection';
import logger from '@shared/Logger';

export default class Reaction extends BaseModel {
    static get tableName() {
        return 'reactions';
    }

    static get idColumn() {
        return ['by_user_id', 'post_id'];
    }

    by_user_id!: number;
    post_id!: number;
    upvote!: boolean;
    downvote!: boolean;
    report_code?: string;

    static async reactPost(reaction: any, postId: number, userId: number) {
        const updateOldReactions = await Reaction.query()
            .update(reaction)
            .where({ post_id: postId, by_user_id: userId })
            .returning('*');

        if (updateOldReactions.length === 0) {
            await Reaction.query()
                .insert(
                    {
                        upvote: reaction.upvote === false ? false : true,
                        downvote: reaction.downvote === false ? false : true,
                        post_id: postId,
                        by_user_id: userId
                    }
                );
            logger.info('Inserted new reaction', reaction);
        }
        else {
            logger.info('Updated old reaction', reaction);
        }

        return true;
    }

    static upvotePost(postId: number, userId: number) {
        return Reaction.reactPost({ upvote: raw('NOT upvote'), downvote: false }, postId, userId);
    }

    static downvotePost(postId: number, userId: number) {
        return Reaction.reactPost({ upvote: false, downvote: raw('NOT downvote') }, postId, userId);
    }

    // children?: Person[];
    // posts?: Comment[];
}