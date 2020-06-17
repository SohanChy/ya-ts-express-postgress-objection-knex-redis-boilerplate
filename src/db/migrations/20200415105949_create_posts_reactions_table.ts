import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
    return knex.schema
        .createTable('posts', (table) => {
            table
                .increments('id')
                .primary()
                .unsigned()
                .notNullable();

            table
                .string('uid')
                .unique()
                .notNullable()

            table
                .string('image_url')
                .nullable();

            table
                .string('text')
                .nullable();

            table
                .integer('by_user_id')
                .unsigned()
                .notNullable();

            table
                .integer('template_id')
                .unsigned()
                .nullable()

            table
                .timestamps(true, true)
        })

        .createTable('reactions', (table) => {
            table
                .integer('by_user_id')
                .unsigned()
                .notNullable();

            table
                .integer('post_id')
                .unsigned()
                .notNullable();

            table
                .boolean('upvote')
                .defaultTo(false);

            table
                .boolean('downvote')
                .defaultTo(false);

            table
                .string('report_code')
                .nullable();
        })
        ;
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema
        .dropTableIfExists('posts')
        .dropTableIfExists('reactions');
}


