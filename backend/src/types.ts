export type Role = 'admin' | 'user'

export interface User {
	id: string
	name: string
	username: string
	role: Role
	active: boolean
}

export interface AuditLog {
	id: string
	userId: string
	action: string
	category: 'login' | 'transaction' | 'user-management' | 'logout' | 'storage' | 'item'
	meta?: Record<string, unknown>
	createdAt: string
}

export interface Item {
	id: string
	name: string
	description?: string
	dimensions: { width: number; height: number; length: number }
	weightGrams: number
	frozen: boolean
	expirable: boolean
	defaultAisleId?: string
}

export interface Batch {
	id: string
	itemId: string
	expiresAt: string
	quantity: number
	aisleId: string
}

export interface StockChange {
	id: string
	itemId: string
	batchId: string
	type: 'in' | 'out'
	quantity: number
	createdAt: string
	aisleId?: string
}

export interface Transaction {
	id: string
	type: 'in' | 'out'
	itemId: string
	quantity: number
	batchId?: string
	expiresAt?: string
	assignedAisles?: string[]
	createdAt: string
	userId: string
}

export interface Aisle {
	id: string
	label: string
	floor: number
	room: number
	frozenOnly?: boolean
}

export interface Room {
	id: string
	floor: number
	name: string
	aisles: Aisle[]
}

export interface DashboardSummary {
	topOutbound: { itemId: string; name: string; totalOut: number }[]
	expiringSoon: Batch[]
	expired: Batch[]
}

export interface StorageConfig {
	rooms: Room[]
}
