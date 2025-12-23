import { Alert, Box, Chip, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Tab, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { api } from '../api/client'
import { AisleGrid } from '../components/AisleGrid'
import { SectionCard } from '../components/SectionCard'
import { StockRow, Room } from '../types'

const socketUrl = import.meta.env.VITE_SOCKET_BASE || 'http://localhost:4001'

export const StockManagementPage = () => {
	const [tab, setTab] = useState(0)
	const [stock, setStock] = useState<StockRow[]>([])
	const [rooms, setRooms] = useState<Room[]>([])
	const [changes, setChanges] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchData = async () => {
		try {
			const [stockRes, aisleRes, changeRes] = await Promise.all([api.getStocks(), api.getAisleView(), api.getStockChanges()])
			setStock(stockRes as StockRow[])
			setRooms(aisleRes as Room[])
			setChanges(changeRes as any[])
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchData()
		const socket = io(socketUrl)
		socket.on('stock:update', (payload) => {
			if (payload?.stock) setStock(payload.stock as StockRow[])
		})
		return () => {
			socket.close()
		}
	}, [])

	const totalStock = useMemo(() => stock.reduce((sum, row) => sum + row.total, 0), [stock])

	if (loading) return <LinearProgress />

	return (
		<Stack gap={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					Stock management
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Realtime stock per item with batch drill-down and aisle visualization.
				</Typography>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
			<Tabs value={tab} onChange={(_, value) => setTab(value)}>
				<Tab label="Table view" />
				<Tab label="Aisle view" />
			</Tabs>
			{tab === 0 && (
				<SectionCard title={`Inventory (${totalStock} units)`}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Item</TableCell>
								<TableCell>Aisles</TableCell>
								<TableCell>Stock</TableCell>
								<TableCell>Expiry</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{stock.map((row) => (
								<TableRow key={row.id}>
									<TableCell>
										<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
											{row.name}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{row.id}
										</Typography>
									</TableCell>
									<TableCell>
										<Stack direction="row" gap={1} flexWrap="wrap">
											{row.batches.map((batch) => (
												<Chip key={batch.id} label={batch.aisleId} size="small" />
											))}
										</Stack>
									</TableCell>
									<TableCell>{row.total}</TableCell>
									<TableCell>
										<Stack gap={1}>
											{row.batches.map((batch) => (
												<Accordion key={batch.id} disableGutters className="card-surface" sx={{ bgcolor: '#0f172a' }}>
													<AccordionSummary expandIcon={<ExpandMoreIcon />}>
														<Typography variant="body2">
															Batch {batch.id} · {batch.quantity} units
														</Typography>
													</AccordionSummary>
													<AccordionDetails>
														<Typography variant="body2" color="text.secondary">
															Aisle {batch.aisleId}
														</Typography>
														<Typography variant="body2" color="text.secondary">
															Expires {new Date(batch.expiresAt).toLocaleDateString()}
														</Typography>
													</AccordionDetails>
												</Accordion>
											))}
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</SectionCard>
			)}
			{tab === 1 && (
			<SectionCard title="Aisle occupancy">
				<AisleGrid rooms={rooms} />
			</SectionCard>
		)}
		<SectionCard title="Stock change history">
			<Stack gap={1}>
				{changes.map((log) => (
					<Box key={log.id} className="card-surface" sx={{ p: 2 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
							{log.type.toUpperCase()} · {log.itemId} · {log.quantity} units
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Batch {log.batchId} · Aisle {log.aisleId ?? 'N/A'} · {new Date(log.createdAt).toLocaleString()}
						</Typography>
					</Box>
				))}
				{changes.length === 0 && (
					<Typography variant="body2" color="text.secondary">
						No stock mutations logged yet.
					</Typography>
				)}
			</Stack>
		</SectionCard>
	</Stack>
)
}
