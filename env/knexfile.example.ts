// Update with your config settings.
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'deshimemes',
      user: 'user',
      password: 'password'
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: '../src/db/migrations' },
    seeds: { directory: '../src/db/seeds/dev' },
    useNullAsDefault: true
  }
};
