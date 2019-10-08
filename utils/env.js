import config from 'dotenv-webpack'
config()

// tiny wrapper with default env vars
export default {
  NODE_ENV: (process.env.NODE_ENV || 'development'),
  PORT: (3000)
}
