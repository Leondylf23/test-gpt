import InventoryIcon from '@mui/icons-material/Inventory'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import TableChartIcon from '@mui/icons-material/TableChart'
import SwapVerticalCircleIcon from '@mui/icons-material/SwapVerticalCircle'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import AssignmentIcon from '@mui/icons-material/Assignment'
import Grid from '@mui/material/GridLegacy'
import { Alert, Box, Chip, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { QuickMenu } from '../components/QuickMenu'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { TopItemsChart } from '../components/TopItemsChart'
import { DashboardSummary } from '../types'

export const DashboardPage = () => {
	const [summary, setSummary] = useState<DashboardSummary | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		api
			.getDashboard()
			.then((data) => setSummary(data as DashboardSummary))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <LinearProgress />

	return (
		<Stack spacing={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					Dashboard
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Quick links to stock, items, storage, and audit records with real-time outbound trends.
				</Typography>
			</Box>
			<QuickMenu
				items={[
					{ to: '/stocks', title: 'Stock management', description: 'Realtime stock by batch and aisle', icon: <TableChartIcon /> },
					{ to: '/items', title: 'Item management', description: 'Dimensions, frozen & expiry flags', icon: <InventoryIcon /> },
					{ to: '/storage', title: 'Storage layout', description: 'Rooms, floors, aisles, and spacers', icon: <WarehouseIcon /> },
					{ to: '/transactions', title: 'Transactions', description: 'Inbound and outbound flows', icon: <SwapVerticalCircleIcon /> },
					{ to: '/users', title: 'Users & roles', description: 'Admin and operator privileges', icon: <PeopleAltIcon /> },
					{ to: '/audit', title: 'Audit log', description: 'Login, stock, and user actions', icon: <AssignmentIcon /> }
				]}
			/>
			{error && <Alert severity="error">{error}</Alert>}
			<Grid container spacing={2}>
				<Grid item xs={12} md={4}>
					<StatCard title="Top outbound items" value={summary?.topOutbound.length ?? 0} hint="Last 50 transactions" />
				</Grid>
				<Grid item xs={12} md={4}>
					<StatCard title="Expiring within 60 days" value={summary?.expiringSoon.length ?? 0} hint="Watch these batches" />
				</Grid>
				<Grid item xs={12} md={4}>
					<StatCard title="Expired batches" value={summary?.expired.length ?? 0} hint="Remove or quarantine" />
				</Grid>
			</Grid>
			<SectionCard title="Top 5 outbound items">
				{summary && summary.topOutbound.length > 0 ? (
					<TopItemsChart data={summary.topOutbound} />
				) : (
					<Typography variant="body2" color="text.secondary">
						No outbound movement recorded yet.
					</Typography>
				)}
			</SectionCard>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<SectionCard title="Expiring within 2 months">
						<Stack gap={1}>
							{summary?.expiringSoon.map((batch) => (
								<Box key={batch.id} className="card-surface" sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
									<div>
										<Typography variant="subtitle1">{batch.itemId}</Typography>
										<Typography variant="caption" color="text.secondary">
											Expires {new Date(batch.expiresAt).toLocaleDateString()}
										</Typography>
									</div>
									<Chip label={`${batch.quantity} units`} color="primary" />
								</Box>
							))}
							{summary?.expiringSoon.length === 0 && (
								<Typography variant="body2" color="text.secondary">
									No batches nearing expiry.
								</Typography>
							)}
						</Stack>
					</SectionCard>
				</Grid>
				<Grid item xs={12} md={6}>
					<SectionCard title="Expired inventory">
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell>Batch</TableCell>
									<TableCell>Item</TableCell>
									<TableCell>Expired</TableCell>
									<TableCell>Stock</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{summary?.expired.map((batch) => (
									<TableRow key={batch.id}>
										<TableCell>{batch.id}</TableCell>
										<TableCell>{batch.itemId}</TableCell>
										<TableCell>{new Date(batch.expiresAt).toLocaleDateString()}</TableCell>
										<TableCell>{batch.quantity}</TableCell>
									</TableRow>
								))}
								{(summary?.expired.length ?? 0) === 0 && (
									<TableRow>
										<TableCell colSpan={4} align="center">
											<Typography variant="body2" color="text.secondary">
												All clear — no expired batches.
											</Typography>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</SectionCard>
				</Grid>
			</Grid>
		</Stack>
	)
}
