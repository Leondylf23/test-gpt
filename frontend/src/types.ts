export type Role = 'admin' | 'user'

export interface User {
	id: string
	name: string
	username: string
	role: Role
	active: boolean
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

export interface StockRow extends Item {
	total: number
	batches: Batch[]
}

export interface DashboardSummary {
	topOutbound: { itemId: string; name: string; totalOut: number }[]
	expiringSoon: Batch[]
	expired: Batch[]
}

export interface Aisle {
	id: string
	label: string
	floor: number
	room: number
	frozenOnly?: boolean
	stock?: number
	items?: string[]
}

export interface Room {
	id: string
	floor: number
	name: string
	aisles: Aisle[]
}

export interface TransactionPayload {
	itemId: string
	quantity: number
	expiresAt?: string
}

export interface AuditLog {
	id: string
	userId: string
	action: string
	category: string
	meta?: Record<string, unknown>
	createdAt: string
}
