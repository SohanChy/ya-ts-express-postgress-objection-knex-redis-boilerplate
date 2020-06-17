import BaseModel from './BaseModel';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { omit } from 'lodash'
import { get_env } from '@shared/loadEnv';
import { Model } from 'objection';
import Post from './Post';

export default class User extends BaseModel {
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return ['id'];
    }

    get $hiddenFields(): string[] {
        return ['id', 'password'];
    }

    enableTimestamps = () => true;

    id!: number;
    role!: string;
    status!: string;
    species!: string;
    first_name?: string;
    last_name?: string;
    email!: string;
    username!: string;
    password!: string;
    stay_anon!: boolean;

    // children?: Person[];
    // posts?: Comment[];

    static async hashAndSaltPassword(plainPassword: string): Promise<string> {
        const genSalt = await new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) reject(err);
                resolve(salt);
            });
        })

        return new Promise((resolve, reject) => {
            bcrypt.hash(plainPassword, genSalt, (err: any, hash: any) => {
                if (err) reject(err);
                resolve(hash);
            })
        });

    }

    async isMatchPassword(plainPassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(plainPassword, this.password, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        })
    }

    async generateGwtToken() {
        return new Promise((resolve, reject) => {
            jwt.sign(
                this.toJSON(),
                get_env('secrets.jwt'),
                {
                    algorithm: 'HS256',
                    expiresIn: '7d'
                },
                (err, token) => {
                    if (err) reject(err);
                    resolve(token);
                }
            );
        }
        );
    }

    static relationMappings = {
        posts: {
            relation: Model.HasManyRelation,
            modelClass: Post,
            join: {
                from: 'posts.by_user_id',
                to: 'users.id'
            }
        }
    };

}