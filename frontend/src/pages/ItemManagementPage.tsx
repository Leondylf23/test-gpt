import Grid from '@mui/material/GridLegacy'
import { Alert, Box, Button, Checkbox, FormControlLabel, LinearProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { SectionCard } from '../components/SectionCard'
import { Item } from '../types'

const initialForm = {
	name: '',
	description: '',
	width: 0,
	height: 0,
	length: 0,
	weightGrams: 0,
	frozen: false,
	expirable: true
}

export const ItemManagementPage = () => {
	const [items, setItems] = useState<Item[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [form, setForm] = useState(initialForm)

	const fetchItems = async () => {
		try {
			const data = await api.getItems()
			setItems(data as Item[])
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchItems()
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const payload = {
				name: form.name,
				description: form.description,
				dimensions: { width: Number(form.width), height: Number(form.height), length: Number(form.length) },
				weightGrams: Number(form.weightGrams),
				frozen: form.frozen,
				expirable: form.expirable
			}
			const created = await api.createItem(payload)
			setItems((prev) => [...prev, created as Item])
			setForm(initialForm)
		} catch (err: any) {
			setError(err.message)
		}
	}

	if (loading) return <LinearProgress />

	return (
		<Stack gap={3}>
			<Box>
				<Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
					Item management
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Configure item master data including dimensions, weight, and cold-chain flags.
				</Typography>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
			<SectionCard title="Create item">
				<form onSubmit={handleSubmit}>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<TextField
								label="Name"
								fullWidth
								value={form.name}
								onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
								required
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="Description"
								fullWidth
								value={form.description}
								onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<TextField
								label="Width (m)"
								type="number"
								fullWidth
								value={form.width}
								onChange={(e) => setForm((f) => ({ ...f, width: Number(e.target.value) }))}
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<TextField
								label="Height (m)"
								type="number"
								fullWidth
								value={form.height}
								onChange={(e) => setForm((f) => ({ ...f, height: Number(e.target.value) }))}
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<TextField
								label="Length (m)"
								type="number"
								fullWidth
								value={form.length}
								onChange={(e) => setForm((f) => ({ ...f, length: Number(e.target.value) }))}
							/>
						</Grid>
						<Grid item xs={12} md={3}>
							<TextField
								label="Weight (g)"
								type="number"
								fullWidth
								value={form.weightGrams}
								onChange={(e) => setForm((f) => ({ ...f, weightGrams: Number(e.target.value) }))}
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={<Checkbox checked={form.frozen} onChange={(e) => setForm((f) => ({ ...f, frozen: e.target.checked }))} />}
								label="Frozen item"
							/>
							<FormControlLabel
								control={
									<Checkbox checked={form.expirable} onChange={(e) => setForm((f) => ({ ...f, expirable: e.target.checked }))} />
								}
								label="Expirable"
							/>
						</Grid>
						<Grid item xs={12}>
							<Button variant="contained" type="submit">
								Save item
							</Button>
						</Grid>
					</Grid>
				</form>
			</SectionCard>
			<SectionCard title="Items">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Item</TableCell>
							<TableCell>Flags</TableCell>
							<TableCell>Dimensions (m)</TableCell>
							<TableCell>Weight (g)</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{items.map((item) => (
							<TableRow key={item.id}>
								<TableCell>
									<Typography variant="subtitle1">{item.name}</Typography>
									<Typography variant="caption" color="text.secondary">
										{item.id}
									</Typography>
								</TableCell>
								<TableCell>
									<Stack direction="row" gap={1} flexWrap="wrap">
										{item.frozen && <Typography variant="caption">Frozen</Typography>}
										{item.expirable && <Typography variant="caption">Expirable</Typography>}
									</Stack>
								</TableCell>
								<TableCell>
									{item.dimensions.width} x {item.dimensions.height} x {item.dimensions.length}
								</TableCell>
								<TableCell>{item.weightGrams}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</SectionCard>
		</Stack>
	)
}
