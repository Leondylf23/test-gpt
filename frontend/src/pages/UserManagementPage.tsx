import Grid from '@mui/material/GridLegacy'
import { Alert, Box, Button, FormControlLabel, LinearProgress, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { SectionCard } from '../components/SectionCard'
import { User } from '../types'

const initialUser = { name: '', username: '', role: 'user', active: true }

export const UserManagementPage = () => {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [form, setForm] = useState(initialUser)

	const loadUsers = async () => {
		try {
			const data = await api.getUsers()
			setUsers(data as User[])
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadUsers()
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const created = await api.createUser(form)
			setUsers((prev) => [...prev, created as User])
			setForm(initialUser)
		} catch (err: any) {
			setError(err.message)
		}
	}

	const handleToggle = async (user: User) => {
		const updated = await api.updateUser(user.id, { active: !user.active })
		setUsers((prev) => prev.map((u) => (u.id === user.id ? (updated as User) : u)))
	}

	if (loading) return <LinearProgress />

	return (
		<Stack gap={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					User management
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Admins can provision operators and manage access to transactions and audit logs.
				</Typography>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
			<SectionCard title="Invite user">
				<form onSubmit={handleSubmit}>
					<Grid container spacing={2}>
						<Grid item xs={12} md={4}>
							<TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
						</Grid>
						<Grid item xs={12} md={4}>
							<TextField
								label="Username"
								fullWidth
								value={form.username}
								onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
							/>
						</Grid>
						<Grid item xs={12} md={4}>
							<TextField
								label="Role"
								fullWidth
								value={form.role}
								onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'user' }))}
							/>
						</Grid>
						<Grid item xs={12}>
							<Button variant="contained" type="submit">
								Create
							</Button>
						</Grid>
					</Grid>
				</form>
			</SectionCard>
			<SectionCard title="Users">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell>
									<Typography variant="subtitle1">{user.name}</Typography>
									<Typography variant="caption" color="text.secondary">
										{user.username}
									</Typography>
								</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell>
									<FormControlLabel
										control={<Switch checked={user.active} onChange={() => handleToggle(user)} />}
										label={user.active ? 'Active' : 'Disabled'}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</SectionCard>
		</Stack>
	)
}
