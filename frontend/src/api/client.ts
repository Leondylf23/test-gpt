const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

const request = async <T>(path: string, options?: RequestInit) => {
	const res = await fetch(`${apiBase}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options?.headers || {})
		}
	})
	if (!res.ok) throw new Error(await res.text())
	return (await res.json()) as T
}

export const api = {
	login: (username: string, password: string) => request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
	getDashboard: () => request('/dashboard'),
	getStocks: () => request('/stocks'),
	getAisleView: () => request('/stocks/aisles'),
	getStockChanges: () => request('/stocks/changes'),
	getItems: () => request('/items'),
	createItem: (payload: any) => request('/items', { method: 'POST', body: JSON.stringify(payload) }),
	getStorage: () => request('/storage'),
	addRoom: (payload: any) => request('/storage/rooms', { method: 'POST', body: JSON.stringify(payload) }),
	addAisle: (roomId: string, payload: any) =>
		request(`/storage/rooms/${roomId}/aisles`, { method: 'POST', body: JSON.stringify(payload) }),
	transactionIn: (entries: any, userId: string) =>
		request('/transactions/in', { method: 'POST', body: JSON.stringify({ entries, userId }) }),
	transactionOut: (entries: any, userId: string) =>
		request('/transactions/out', { method: 'POST', body: JSON.stringify({ entries, userId }) }),
	getAudit: () => request('/audit'),
	getUsers: () => request('/users'),
	createUser: (payload: any) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
	updateUser: (id: string, payload: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}
