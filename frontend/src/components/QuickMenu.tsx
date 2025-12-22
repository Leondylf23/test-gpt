import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface Props {
	items: { to: string; title: string; description: string; icon: ReactNode }[]
}

export const QuickMenu = ({ items }: Props) => (
	<Stack direction="row" gap={2} flexWrap="wrap">
		{items.map((item) => (
			<Card key={item.to} className="card-surface" sx={{ minWidth: 220, flex: '1 1 220px' }}>
				<CardActionArea component={RouterLink} to={item.to}>
					<CardContent sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
						<div className="rounded-full bg-slate-800 p-2 text-accent">{item.icon}</div>
						<div>
							<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
								{item.title}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{item.description}
							</Typography>
						</div>
					</CardContent>
				</CardActionArea>
			</Card>
		))}
	</Stack>
)
