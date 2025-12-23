import { Card, CardContent, CardHeader } from '@mui/material'
import { ReactNode } from 'react'

export const SectionCard = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
	<Card className="card-surface" sx={{ width: '100%' }}>
		<CardHeader title={title} action={action} />
		<CardContent>{children}</CardContent>
	</Card>
)
