export const env = {
	port: Number(process.env.PORT || 4000),
	socketPort: Number(process.env.SOCKET_PORT || 4001),
	mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/warehouse',
	postgresUri: process.env.POSTGRES_URI || 'postgres://localhost:5432/warehouse',
	redisUri: process.env.REDIS_URI || 'redis://localhost:6379'
}
