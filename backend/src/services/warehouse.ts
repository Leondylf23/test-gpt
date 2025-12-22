import { randomUUID } from 'crypto'
import { store } from '../data/store'
import type { AuditLog, Batch, DashboardSummary, Item, Room, StockChange, Transaction, User } from '../types'
import { generateAisleId } from '../utils/aisle'

const toIso = (date = new Date()) => date.toISOString()

export class WarehouseService {
	private emitStock?: (payload: unknown) => void

	constructor(emitStock?: (payload: unknown) => void) {
		this.emitStock = emitStock
	}

	private logAudit(entry: Omit<AuditLog, 'id' | 'createdAt'>) {
		const audit: AuditLog = { ...entry, id: randomUUID(), createdAt: toIso() }
		store.auditLogs.unshift(audit)
		return audit
	}

	login(username: string) {
		const user = store.users.find((u) => u.username === username && u.active)
		if (!user) return null
		this.logAudit({ userId: user.id, action: 'login', category: 'login' })
		return user
	}

	listItems() {
		return store.items
	}

	createItem(payload: Omit<Item, 'id'>) {
		const id = payload.name.trim().toUpperCase().slice(0, 3) + '-' + String(store.items.length + 1).padStart(3, '0')
		const item: Item = { ...payload, id }
		store.items.push(item)
		this.logAudit({ userId: 'admin', action: `create-item:${id}`, category: 'item' })
		return item
	}

	updateItem(id: string, payload: Partial<Item>) {
		const idx = store.items.findIndex((i) => i.id === id)
		if (idx === -1) return null
		const current = store.items[idx]
		if (!current) return null
		const updated: Item = {
			...current,
			...payload,
			id: current.id,
			name: payload.name ?? current.name,
			description: payload.description ?? current.description,
			dimensions: payload.dimensions ?? current.dimensions,
			weightGrams: payload.weightGrams ?? current.weightGrams,
			frozen: payload.frozen ?? current.frozen,
			expirable: payload.expirable ?? current.expirable,
			defaultAisleId: payload.defaultAisleId ?? current.defaultAisleId
		}
		store.items[idx] = updated
		this.logAudit({ userId: 'admin', action: `update-item:${id}`, category: 'item' })
		return store.items[idx]
	}

	deleteItem(id: string) {
		const idx = store.items.findIndex((i) => i.id === id)
		if (idx === -1) return false
		store.items.splice(idx, 1)
		this.logAudit({ userId: 'admin', action: `delete-item:${id}`, category: 'item' })
		return true
	}

	getDashboard(): DashboardSummary {
		const now = new Date()
		const soon = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
		const expiringSoon = store.batches.filter((b) => new Date(b.expiresAt) > now && new Date(b.expiresAt) <= soon)
		const expired = store.batches.filter((b) => new Date(b.expiresAt) < now)

		const outboundCounts = store.transactions
			.filter((t) => t.type === 'out')
			.reduce<Record<string, number>>((acc, t) => {
				acc[t.itemId] = (acc[t.itemId] || 0) + t.quantity
				return acc
			}, {})

		const topOutbound = Object.entries(outboundCounts)
			.map(([itemId, totalOut]) => ({
				itemId,
				totalOut,
				name: store.items.find((i) => i.id === itemId)?.name || itemId
			}))
			.sort((a, b) => b.totalOut - a.totalOut)
			.slice(0, 5)

		return { topOutbound, expiringSoon, expired }
	}

	getStockTableView() {
		return store.items.map((item) => {
			const batches = store.batches.filter((b) => b.itemId === item.id)
			const total = batches.reduce((sum, b) => sum + b.quantity, 0)
			return { ...item, total, batches }
		})
	}

	getAisleView() {
		return store.rooms.map((room) => ({
			...room,
			aisles: room.aisles.map((aisle) => {
				const batches = store.batches.filter((b) => b.aisleId === aisle.label)
				const stock = batches.reduce((sum, b) => sum + b.quantity, 0)
				const itemNames = [...new Set(batches.map((b) => store.items.find((i) => i.id === b.itemId)?.name || b.itemId))]
				return { ...aisle, stock, items: itemNames }
			})
		}))
	}

	getStorage() {
		return store.rooms
	}

	addRoom(name: string, floor: number) {
		const aisles = Array.from({ length: 2 }).map((_, idx) => ({
			id: randomUUID(),
			label: generateAisleId(floor, store.rooms.length, idx),
			floor,
			room: store.rooms.length
		}))
		const room: Room = { id: randomUUID(), floor, name, aisles }
		store.rooms.push(room)
		this.logAudit({ userId: 'admin', action: `add-room:${name}`, category: 'storage' })
		return room
	}

	addAisle(roomId: string, frozenOnly?: boolean) {
		const roomIndex = store.rooms.findIndex((r) => r.id === roomId)
		if (roomIndex === -1) return null
		const room = store.rooms[roomIndex]
		if (!room) return null
		const aisle = {
			id: randomUUID(),
			label: generateAisleId(room.floor, roomIndex, room.aisles.length),
			floor: room.floor,
			room: roomIndex,
			frozenOnly
		}
		room.aisles.push(aisle)
		this.logAudit({ userId: 'admin', action: `add-aisle:${aisle.label}`, category: 'storage' })
		return aisle
	}

	removeAisle(roomId: string, aisleId: string) {
		const roomIndex = store.rooms.findIndex((r) => r.id === roomId)
		if (roomIndex === -1) return false
		const room = store.rooms[roomIndex]
		if (!room) return false
		const idx = room.aisles.findIndex((a) => a.id === aisleId)
		if (idx === -1) return false
		room.aisles.splice(idx, 1)
		this.logAudit({ userId: 'admin', action: `remove-aisle:${aisleId}`, category: 'storage' })
		return true
	}

	transactionIn(entries: { itemId: string; quantity: number; expiresAt: string }[], userId: string): Transaction[] {
		const assigned: Transaction[] = []
		for (const entry of entries) {
			const item = store.items.find((i) => i.id === entry.itemId)
			if (!item) continue
			const aisleId =
				store.batches.find((b) => b.itemId === entry.itemId)?.aisleId ||
				item.defaultAisleId ||
				store.rooms[0]?.aisles[0]?.label ||
				'001/0001/AA01'
			const batchId = `BATCH-${store.batches.length + 1001}`
			const batch: Batch = { id: batchId, itemId: entry.itemId, quantity: entry.quantity, expiresAt: entry.expiresAt, aisleId }
			store.batches.push(batch)
			const transaction: Transaction = {
				id: randomUUID(),
				type: 'in',
				itemId: entry.itemId,
				quantity: entry.quantity,
				batchId,
				expiresAt: entry.expiresAt,
				assignedAisles: [aisleId],
				userId,
				createdAt: toIso()
			}
			const change: StockChange = {
				id: randomUUID(),
				itemId: entry.itemId,
				batchId,
				type: 'in',
				quantity: entry.quantity,
				createdAt: toIso(),
				aisleId
			}
			store.stockChanges.unshift(change)
			store.transactions.unshift(transaction)
			this.logAudit({ userId, action: `transaction-in:${entry.itemId}`, category: 'transaction', meta: { aisleId, batchId } })
			assigned.push(transaction)
		}
		this.emitStock?.({ type: 'in', stock: this.getStockTableView() })
		return assigned
	}

	transactionOut(entries: { itemId: string; quantity: number }[], userId: string) {
		const results: Transaction[] = []
		for (const entry of entries) {
			const batches = store.batches
				.filter((b) => b.itemId === entry.itemId && b.quantity > 0)
				.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())

			let remaining = entry.quantity
			for (const batch of batches) {
				if (remaining <= 0) break
				const consume = Math.min(batch.quantity, remaining)
				batch.quantity -= consume
				remaining -= consume

				const transaction: Transaction = {
					id: randomUUID(),
					type: 'out',
					itemId: entry.itemId,
					quantity: consume,
					batchId: batch.id,
					assignedAisles: [batch.aisleId],
					userId,
					createdAt: toIso()
				}
				const change: StockChange = {
					id: randomUUID(),
					itemId: entry.itemId,
					batchId: batch.id,
					type: 'out',
					quantity: consume,
					createdAt: toIso(),
					aisleId: batch.aisleId
				}
				store.transactions.unshift(transaction)
				store.stockChanges.unshift(change)
				results.push(transaction)
				this.logAudit({
					userId,
					action: `transaction-out:${entry.itemId}`,
					category: 'transaction',
					meta: { batchId: batch.id, aisleId: batch.aisleId }
				})
			}
		}
		this.emitStock?.({ type: 'out', stock: this.getStockTableView() })
		return results
	}

	listAudit() {
		return store.auditLogs.slice(0, 50)
	}

	listStockChanges() {
		return store.stockChanges.slice(0, 50)
	}

	listUsers() {
		return store.users
	}

	createUser(user: Omit<User, 'id'>) {
		const newUser: User = { ...user, id: randomUUID() }
		store.users.push(newUser)
		this.logAudit({ userId: 'admin', action: `create-user:${newUser.username}`, category: 'user-management' })
		return newUser
	}

	updateUser(id: string, payload: Partial<User>) {
		const idx = store.users.findIndex((u) => u.id === id)
		if (idx === -1) return null
		const current = store.users[idx]
		if (!current) return null
		const updated: User = {
			...current,
			...payload,
			id: current.id,
			name: payload.name ?? current.name,
			username: payload.username ?? current.username,
			role: payload.role ?? current.role,
			active: payload.active ?? current.active
		}
		store.users[idx] = updated
		this.logAudit({ userId: 'admin', action: `update-user:${id}`, category: 'user-management' })
		return store.users[idx]
	}
}
