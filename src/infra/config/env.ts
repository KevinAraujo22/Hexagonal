const env = process.env

export const envConfig = {
    MONGODB_URI: env.MONGODB_URI, 
    JWT_SECRET: env.JWT_SECRET,
    PORT : env.PORT,
    NODE_ENV : env.NODE_ENV
}