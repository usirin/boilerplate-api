const Dotenv = require('dotenv')
const Confidence = require('confidence')
const Toys = require('toys')

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` })

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    debug: {
      $filter: 'NODE_ENV',
      development: {
        log: ['error', 'implementation', 'internal'],
        request: ['error', 'implementation', 'internal'],
      },
    },
  },
  register: {
    plugins: [
      {
        plugin: '../lib', // Main plugin
        options: {
          jwtKey: process.env.JWT_SECRET,
          email: {
            secret: process.env.SENDGRID_API_KEY,
          },
          rsmq: {
            host: process.env.RSMQ_HOST,
          },
        },
      },
      {
        plugin: './plugins/swagger',
      },
      {
        plugin: 'schwifty',
        options: {
          $filter: 'NODE_ENV',
          $default: {},
          $base: {
            migrateOnStart: true,
            knex: {
              client: 'pg',
              useNullAsDefault: true,
              connection: {
                debug: process.env.DB_DEBUG,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
              },
            },
          },
          development: {
            migrateOnStart: true,
            knex: {
              client: 'pg',
              useNullAsDefault: true,
              connection: {
                debug: process.env.DB_DEBUG,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
              },
            },
          },
          production: {
            migrateOnStart: false,
          },
        },
      },
      {
        plugin: {
          $filter: 'NODE_ENV',
          $default: 'hpal-debug',
          production: Toys.noop,
        },
      },
    ],
  },
})
