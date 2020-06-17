# Yet Another Typescript + Express + Postgress + Objection(ORM) + Knex(Querybuilder) + Redis API Boilerplate

# Includes Configuration Boilerplate Of:
- Typescript
- Express
- Setup of Postgres Connection
- Objection ORM setup & basic examples
- Basic Structured Routing, Controller & Validation

# Extras
- User model and auth(signup/login) example
- Passport auth with jwt implementation example
- Gloud support
- Proxy for Gloud
- Bangla word based uuid generator
- Image upload example

# Setup

### Dev Requirements
- Postgres database & user credentials
- yarn


### Setup
- run command: `yarn`
- **Mandatory**: In env directory: Copy **example.env** to  **.env** and put in your env setup
- **For knex cli**: In env directory: Copy **knexfile.example.env** to  **knexfile.env** and put in your db env setup
- run command `yarn start:dev` and you should be up and running


# TODO
- Need to add redis
- Need to better organize and refactor config files, right now there are so many of them, and in the root dir, its too much.