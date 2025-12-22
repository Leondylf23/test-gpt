import { Alert, Box, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { SectionCard } from '../components/SectionCard'
import { AuditLog } from '../types'

export const AuditLogPage = () => {
	const [logs, setLogs] = useState<AuditLog[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		api
			.getAudit()
			.then((data) => setLogs(data as AuditLog[]))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <LinearProgress />

	return (
		<Stack gap={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					Audit log
				</Typography>
				<Typography variant="body1" color="text.secondary">
					View authentication events, stock changes, and user management actions logged to Postgres and Mongo projections.
				</Typography>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
			<SectionCard title="Recent activity">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Time</TableCell>
							<TableCell>Category</TableCell>
							<TableCell>Action</TableCell>
							<TableCell>User</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{logs.map((log) => (
							<TableRow key={log.id}>
								<TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
								<TableCell>{log.category}</TableCell>
								<TableCell>{log.action}</TableCell>
								<TableCell>{log.userId}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</SectionCard>
		</Stack>
	)
}
