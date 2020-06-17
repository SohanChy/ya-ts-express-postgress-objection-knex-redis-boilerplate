import BaseModel from './BaseModel';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { omit } from 'lodash'
import { get_env } from '@shared/loadEnv';
import Reaction from './Reaction';
import { Model, raw } from 'objection';
import { getGCSPUrl } from '@shared/accessors';

export default class Post extends BaseModel {
    static get tableName() {
        return 'posts';
    }

    static get idColumn() {
        return ['id'];
    }

    static get virtualAttributes() {
        return ['image_url_full'];
    }

    get $hiddenFields(): string[] {
        return ['image_url'];
    }

    enableTimestamps = () => true;

    id!: number;
    uid!: string;
    image_url!: string;
    text?: string;
    by_user_id!: number;

    get image_url_full() {
        return getGCSPUrl(this.image_url);
    }

    static async findByUid(uid: string) {
        return Post.query().where('uid', uid).first()
    }

    static queryWithLikes() {
        return Post.query().select('posts.*', 'r_count.trend_count')
            .leftOuterJoin(raw(`(
                select
                    post_id,
                    (
                        sum(CASE WHEN upvote = TRUE THEN 1 ELSE 0 END)
                        -
                        sum(CASE WHEN downvote = TRUE THEN 1 ELSE 0 END)
                    )::int trend_count
                from reactions
                group by post_id
            ) r_count`), 'r_count.post_id', 'posts.id');
    }

    static async getRankedPosts(limit: number = 20, offset: number = 0) {
        const knex = Post.knex();
        return knex.raw(`
    select p.* from posts p
    left outer join (
        select
            post_id,
            (
                sum(CASE WHEN upvote = TRUE THEN 1 ELSE 0 END)
                -
                sum(CASE WHEN downvote = TRUE THEN 1 ELSE 0 END)
            ) positive_count
        from reactions
        group by post_id
    ) r_count
    on p.id = r_count.post_id
    order by r_count.positive_count desc
    limit ${limit} offset ${offset};`);
    }

    reactions?: Reaction[];

    static relationMappings = {
        reactions: {
            relation: Model.HasManyRelation,
            modelClass: Reaction,
            join: {
                from: 'posts.id',
                to: 'reactions.post_id'
            }
        }
    };
}