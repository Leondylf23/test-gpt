import { Box, Chip, Tooltip, Typography } from '@mui/material'
import { Room } from '../types'

export const AisleGrid = ({ rooms }: { rooms: Room[] }) => (
	<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
		{rooms.map((room) => (
			<Box key={room.id}>
				<Typography variant="subtitle1" sx={{ mb: 1 }}>
					{room.name} · Floor {room.floor + 1}
				</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.5 }}>
					{room.aisles.map((aisle) => (
						<Tooltip
							key={aisle.id}
							title={
								<Box sx={{ p: 1 }}>
									<Typography variant="subtitle2">{aisle.label}</Typography>
									<Typography variant="body2" color="text.secondary">
										{aisle.items?.length ? aisle.items.join(', ') : 'Empty'}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Stock: {aisle.stock ?? 0}
									</Typography>
								</Box>
							}
						>
							<Box
								className="card-surface glass"
								sx={{
									p: 2,
									border: '1px dashed #1f2937',
									minHeight: 110,
									display: 'flex',
									flexDirection: 'column',
									gap: 1
								}}
							>
								<Typography variant="subtitle2">{aisle.label}</Typography>
								<Chip size="small" label={`Stock ${aisle.stock ?? 0}`} color="primary" variant="outlined" />
								{aisle.frozenOnly && <Chip size="small" color="secondary" label="Frozen" />}
							</Box>
						</Tooltip>
					))}
				</Box>
			</Box>
		))}
	</Box>
)
