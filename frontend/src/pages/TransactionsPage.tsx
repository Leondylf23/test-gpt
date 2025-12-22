import Grid from '@mui/material/GridLegacy'
import { Alert, Box, Button, Chip, LinearProgress, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { SectionCard } from '../components/SectionCard'
import { Item, TransactionPayload } from '../types'
import { useAuth } from '../context/AuthContext'

export const TransactionsPage = () => {
	const [tab, setTab] = useState(0)
	const [items, setItems] = useState<Item[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [entries, setEntries] = useState<TransactionPayload[]>([{ itemId: '', quantity: 0, expiresAt: '' }])
	const [outEntries, setOutEntries] = useState<TransactionPayload[]>([{ itemId: '', quantity: 0 }])
	const [result, setResult] = useState<any[]>([])
	const { user } = useAuth()

	useEffect(() => {
		api
			.getItems()
			.then((data) => setItems(data as Item[]))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false))
	}, [])

	const handleInSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const clean = entries.filter((e) => e.itemId && e.quantity > 0 && e.expiresAt)
			const res = await api.transactionIn(clean, user?.id || 'admin')
			setResult(res as any[])
		} catch (err: any) {
			setError(err.message)
		}
	}

	const handleOutSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const clean = outEntries.filter((e) => e.itemId && e.quantity > 0)
			const res = await api.transactionOut(clean, user?.id || 'admin')
			setResult(res as any[])
		} catch (err: any) {
			setError(err.message)
		}
	}

	if (loading) return <LinearProgress />

	return (
		<Stack gap={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					Transactions
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Handle inbound with auto-generated batches and outbound honoring shortest expiry first.
				</Typography>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
			<Tabs value={tab} onChange={(_, value) => setTab(value)}>
				<Tab label="Transaction in" />
				<Tab label="Transaction out" />
			</Tabs>
			{tab === 0 && (
				<SectionCard title="Inbound items">
					<form onSubmit={handleInSubmit}>
						<Stack gap={2}>
							{entries.map((entry, idx) => (
								<Grid container spacing={2} key={idx}>
									<Grid item xs={12} md={4}>
										<TextField
											label="Item ID"
											select={false}
											value={entry.itemId}
											onChange={(e) =>
												setEntries((prev) => prev.map((p, i) => (i === idx ? { ...p, itemId: e.target.value } : p)))
											}
											placeholder={items[0]?.id}
											fullWidth
										/>
									</Grid>
									<Grid item xs={12} md={3}>
										<TextField
											label="Quantity"
											type="number"
											value={entry.quantity}
											onChange={(e) =>
												setEntries((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: Number(e.target.value) } : p)))
											}
											fullWidth
										/>
									</Grid>
									<Grid item xs={12} md={5}>
										<TextField
											label="Expires at"
											type="date"
											value={entry.expiresAt}
											onChange={(e) =>
												setEntries((prev) => prev.map((p, i) => (i === idx ? { ...p, expiresAt: e.target.value } : p)))
											}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>
								</Grid>
							))}
							<Button onClick={() => setEntries((prev) => [...prev, { itemId: '', quantity: 0, expiresAt: '' }])}>Add item</Button>
							<Button variant="contained" type="submit">
								Save inbound
							</Button>
						</Stack>
					</form>
				</SectionCard>
			)}
			{tab === 1 && (
				<SectionCard title="Outbound items">
					<form onSubmit={handleOutSubmit}>
						<Stack gap={2}>
							{outEntries.map((entry, idx) => (
								<Grid container spacing={2} key={idx}>
									<Grid item xs={12} md={6}>
										<TextField
											label="Item ID"
											value={entry.itemId}
											onChange={(e) =>
												setOutEntries((prev) => prev.map((p, i) => (i === idx ? { ...p, itemId: e.target.value } : p)))
											}
											fullWidth
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="Quantity"
											type="number"
											value={entry.quantity}
											onChange={(e) =>
												setOutEntries((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: Number(e.target.value) } : p)))
											}
											fullWidth
										/>
									</Grid>
								</Grid>
							))}
							<Button onClick={() => setOutEntries((prev) => [...prev, { itemId: '', quantity: 0 }])}>Add item</Button>
							<Button variant="contained" type="submit">
								Save outbound
							</Button>
						</Stack>
					</form>
				</SectionCard>
			)}
			{result.length > 0 && (
				<SectionCard title="Transaction result">
					<Stack gap={1}>
						{result.map((row) => (
							<Box key={row.id} className="card-surface" sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
								<div>
									<Typography variant="subtitle2">
										{row.type.toUpperCase()} · {row.itemId}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Batch {row.batchId || row.expiresAt} · {new Date(row.createdAt).toLocaleString()}
									</Typography>
								</div>
								<Stack direction="row" gap={1}>
									<Chip label={`${row.quantity} units`} color="primary" />
									{row.assignedAisles?.map((aisle: string) => (
										<Chip key={aisle} label={aisle} variant="outlined" />
									))}
								</Stack>
							</Box>
						))}
					</Stack>
				</SectionCard>
			)}
		</Stack>
	)
}
