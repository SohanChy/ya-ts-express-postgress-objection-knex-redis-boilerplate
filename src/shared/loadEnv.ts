import dotenv from 'dotenv';
import commandLineArgs from 'command-line-args';
import { get as _get } from 'lodash'

// Setup command line options
const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'production',
        type: String,
    },
]);

// Set the env file
const loadEnv = dotenv.config({
    path: `./env/${options.env}.env`,
});


if (loadEnv.error) {
    throw loadEnv.error;
}

export function get_env(key: string, defaultValue = null) {
    const envs = {
        app: {
            host: process.env.APP_HOST
        },
        db: {
            client: 'pg',
            connection: {
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            },
            pool: {
                min: 2,
                max: 10
            },
            migrations: {
                directory: './db/migrations'
            },
            seeds: {
                directory: './db/seeds/dev'
            },
            useNullAsDefault: true
        },
        secrets: {
            jwt: process.env.JWT_SECRET,
            gcloud_storage_bucket: process.env.GCLOUD_STORAGE_BUCKET
        }
    };

    return _get(envs, key, defaultValue);
}
