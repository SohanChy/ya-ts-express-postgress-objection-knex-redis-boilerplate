import Knex from 'knex';
import logger from '@shared/Logger';
import { get_env } from '@shared/loadEnv';

// Initialize knex.
const knex = Knex(get_env('db'));

async function testConnection(): Promise<void> {
    const res = await knex.raw('select 1+1 as result').catch((err) => {
        logger.error(err.message, err)
        process.exit(1);
    });

    if (res.rows.length > 0) {
        logger.info('Successfully connected to Database.');
    }
}
testConnection();


export default knex;
