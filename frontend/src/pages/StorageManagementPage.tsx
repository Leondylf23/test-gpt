import Grid from '@mui/material/GridLegacy'
import { Alert, Box, Button, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { AisleGrid } from '../components/AisleGrid'
import { SectionCard } from '../components/SectionCard'
import { Room } from '../types'

export const StorageManagementPage = () => {
	const [rooms, setRooms] = useState<Room[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [roomName, setRoomName] = useState('')
	const [floor, setFloor] = useState(0)
	const [targetRoom, setTargetRoom] = useState('')

	const fetchStorage = async () => {
		try {
			const data = (await api.getStorage()) as Room[]
			setRooms(data)
			if (data?.length) setTargetRoom(data[0].id)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchStorage()
	}, [])

	const handleAddRoom = async (e: React.FormEvent) => {
		e.preventDefault()
		const created = await api.addRoom({ name: roomName || `Room ${rooms.length + 1}`, floor: Number(floor) })
		setRooms((prev) => [...prev, created as Room])
		setRoomName('')
	}

	const handleAddAisle = async () => {
		if (!targetRoom) return
		const created = await api.addAisle(targetRoom, { frozenOnly: false })
		if (!created) return
		setRooms((prev) => prev.map((r) => (r.id === targetRoom ? { ...r, aisles: [...r.aisles, created as any] } : r)))
	}

	if (loading) return <LinearProgress />

	return (
		<Stack gap={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					Storage management
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Manage rooms, floors, aisle spacers, and frozen allocations. Aisle IDs follow floor/room/alphabetic-number format.
				</Typography>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<SectionCard title="Add room">
						<form onSubmit={handleAddRoom}>
							<Stack gap={2}>
								<TextField label="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} fullWidth />
								<TextField
									label="Floor"
									type="number"
									value={floor}
									onChange={(e) => setFloor(Number(e.target.value))}
									fullWidth
								/>
								<Button variant="contained" type="submit">
									Add room
								</Button>
							</Stack>
						</form>
					</SectionCard>
				</Grid>
				<Grid item xs={12} md={6}>
					<SectionCard title="Add aisle">
						<Stack gap={2}>
							<TextField
								label="Room ID"
								value={targetRoom}
								onChange={(e) => setTargetRoom(e.target.value)}
								helperText="Use an existing room ID to add aisles"
							/>
							<Button variant="outlined" onClick={handleAddAisle}>
								Add aisle to room
							</Button>
						</Stack>
					</SectionCard>
				</Grid>
			</Grid>
			<SectionCard title="Storage blueprint">
				<AisleGrid rooms={rooms} />
			</SectionCard>
			<SectionCard title="Rooms detail">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Room</TableCell>
							<TableCell>Floor</TableCell>
							<TableCell>Aisles</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rooms.map((room) => (
							<TableRow key={room.id}>
								<TableCell>
									<Typography variant="subtitle1">{room.name}</Typography>
									<Typography variant="caption" color="text.secondary">
										{room.id}
									</Typography>
								</TableCell>
								<TableCell>{room.floor + 1}</TableCell>
								<TableCell>{room.aisles.length}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</SectionCard>
		</Stack>
	)
}
