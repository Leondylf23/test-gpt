import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const LoginPage = () => {
	const { login, user } = useAuth()
	const [username, setUsername] = useState('admin')
	const [password, setPassword] = useState('demo')
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	useEffect(() => {
		if (user) navigate('/')
	}, [user, navigate])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await login(username, password)
		} catch (err: any) {
			setError(err.message)
		}
	}

	return (
		<Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
			<Card className="card-surface glass" sx={{ maxWidth: 420, width: '100%' }}>
				<CardContent>
					<Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
						Warehouse Management
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Login to access stock, storage, and transaction controls.
					</Typography>
					<form onSubmit={handleSubmit}>
						<Stack spacing={2}>
							<TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
							<TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
							{error && (
								<Typography variant="caption" color="error">
									{error}
								</Typography>
							)}
							<Button type="submit" variant="contained" size="large">
								Sign in
							</Button>
						</Stack>
					</form>
				</CardContent>
			</Card>
		</Box>
	)
}
