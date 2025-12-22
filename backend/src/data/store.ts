import { randomUUID } from 'crypto'
import { generateAisleId } from '../utils/aisle'
import type { AuditLog, Batch, Item, Room, StockChange, Transaction, User } from '../types'

const now = new Date()
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

const defaultRooms: Room[] = Array.from({ length: 2 }).map((_, floor) => {
	const roomId = randomUUID()
	const aisles = Array.from({ length: 6 }).map((__, aisleIndex) => ({
		id: randomUUID(),
		label: generateAisleId(floor, 0, aisleIndex),
		floor,
		room: 0,
		frozenOnly: aisleIndex % 3 === 0
	}))
	return { id: roomId, floor, name: `Room ${floor + 1}`, aisles }
})

const primaryRoom = defaultRooms[0]!
const secondaryRoom = defaultRooms[1]!

const defaultItems: Item[] = [
	{
		id: 'SKU-001',
		name: 'Frozen Vaccine',
		description: 'Temperature controlled vaccine',
		dimensions: { width: 0.2, height: 0.1, length: 0.2 },
		weightGrams: 450,
		frozen: true,
		expirable: true,
		defaultAisleId: primaryRoom?.aisles[0]?.label
	},
	{
		id: 'SKU-002',
		name: 'Dried Beans',
		description: 'Shelf-stable dried beans',
		dimensions: { width: 0.4, height: 0.3, length: 0.6 },
		weightGrams: 1000,
		frozen: false,
		expirable: false,
		defaultAisleId: primaryRoom?.aisles[2]?.label
	},
	{
		id: 'SKU-003',
		name: 'Fresh Juice',
		description: 'Cold pressed juice pack',
		dimensions: { width: 0.25, height: 0.25, length: 0.4 },
		weightGrams: 750,
		frozen: false,
		expirable: true,
		defaultAisleId: primaryRoom?.aisles[3]?.label
	}
]

const defaultBatches: Batch[] = [
	{
		id: 'BATCH-1001',
		itemId: 'SKU-001',
		expiresAt: daysFromNow(30),
		quantity: 120,
		aisleId: primaryRoom?.aisles[0]?.label ?? '001/0001/AA01'
	},
	{
		id: 'BATCH-1002',
		itemId: 'SKU-003',
		expiresAt: daysFromNow(15),
		quantity: 60,
		aisleId: primaryRoom?.aisles[3]?.label ?? '001/0001/AA04'
	},
	{
		id: 'BATCH-1003',
		itemId: 'SKU-003',
		expiresAt: daysFromNow(-5),
		quantity: 8,
		aisleId: secondaryRoom?.aisles[1]?.label ?? '002/0001/AB02'
	}
]

const defaultUsers: User[] = [
	{ id: 'admin', name: 'Admin', username: 'admin', role: 'admin', active: true },
	{ id: 'operator', name: 'Operator', username: 'operator', role: 'user', active: true }
]

export const store = {
	items: defaultItems,
	batches: defaultBatches,
	transactions: [] as Transaction[],
	stockChanges: [] as StockChange[],
	auditLogs: [] as AuditLog[],
	rooms: defaultRooms,
	users: defaultUsers
}
