import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { env } from './config/env'
import { WarehouseService } from './services/warehouse'

dotenv.config()

const io = new Server(env.socketPort, {
	cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
})

const warehouse = new WarehouseService((payload) => io.emit('stock:update', payload))

const api = new Elysia({ prefix: '/api' })
	.use(cors())
	.get('/health', () => ({ status: 'ok' }))
	.post('/auth/login', ({ body }) => {
		const { username } = body as { username: string; password?: string }
		const user = warehouse.login(username)
		if (!user) return new Response('Unauthorized', { status: 401 })
		return { user, token: `demo-${user.id}` }
	})
	.get('/dashboard', () => warehouse.getDashboard())
	.get('/stocks', () => warehouse.getStockTableView())
	.get('/stocks/aisles', () => warehouse.getAisleView())
	.get('/stocks/changes', () => warehouse.listStockChanges())
	.get('/items', () => warehouse.listItems())
	.post('/items', ({ body }) => warehouse.createItem(body as any))
	.put('/items/:id', ({ params, body }) => warehouse.updateItem(params.id, body as any))
	.delete('/items/:id', ({ params }) => ({ success: warehouse.deleteItem(params.id) }))
	.get('/storage', () => warehouse.getStorage())
	.post('/storage/rooms', ({ body }) => {
		const { name, floor } = body as { name: string; floor: number }
		return warehouse.addRoom(name, floor)
	})
	.post('/storage/rooms/:roomId/aisles', ({ params, body }) => warehouse.addAisle(params.roomId, (body as any).frozenOnly))
	.delete('/storage/rooms/:roomId/aisles/:aisleId', ({ params }) => ({ success: warehouse.removeAisle(params.roomId, params.aisleId) }))
	.post('/transactions/in', ({ body }) => {
		const { entries, userId } = body as { entries: { itemId: string; quantity: number; expiresAt: string }[]; userId: string }
		return warehouse.transactionIn(entries, userId || 'admin')
	})
	.post('/transactions/out', ({ body }) => {
		const { entries, userId } = body as { entries: { itemId: string; quantity: number }[]; userId: string }
		return warehouse.transactionOut(entries, userId || 'admin')
	})
	.get('/audit', () => warehouse.listAudit())
	.get('/users', () => warehouse.listUsers())
	.post('/users', ({ body }) => warehouse.createUser(body as any))
	.put('/users/:id', ({ params, body }) => warehouse.updateUser(params.id, body as any))

api.listen({ port: env.port, hostname: '0.0.0.0' })

console.log(`API ready on http://localhost:${env.port}/api`)
console.log(`Socket ready on http://localhost:${env.socketPort}`)
