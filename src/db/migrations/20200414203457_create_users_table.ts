import * as Knex from 'knex';


export async function up(knex: Knex): Promise<any> {
    return knex.schema
        .createTable('users', (table) => {
            table
                .increments('id')
                .primary()
                .unsigned();

            table
                .string('first_name')
                .nullable();

            table
                .string('last_name')
                .nullable();

            table
                .string('email')
                .nullable();

            table
                .string('username')
                .unique()
                .notNullable();

            table
                .string('role')
                .defaultTo('user')
                .notNullable();

            table
                .string('status')
                .defaultTo('active')
                .notNullable();

            table
                .string('species')
                .defaultTo('new_user')
                .notNullable();

            table
                .boolean('stay_anon')
                .defaultTo(false)

            table
                .string('password')
                .notNullable()

            table
                .timestamps(true, true)
        });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema
        .dropTableIfExists('users');
}

