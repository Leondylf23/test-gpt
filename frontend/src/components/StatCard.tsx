import { Card, CardContent, Typography } from '@mui/material'

interface Props {
	title: string
	value: string | number
	hint?: string
}

export const StatCard = ({ title, value, hint }: Props) => (
	<Card className="card-surface" sx={{ minWidth: 200 }}>
		<CardContent>
			<Typography variant="body2" color="text.secondary">
				{title}
			</Typography>
			<Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
				{value}
			</Typography>
			{hint && (
				<Typography variant="caption" color="text.secondary">
					{hint}
				</Typography>
			)}
		</CardContent>
	</Card>
)
