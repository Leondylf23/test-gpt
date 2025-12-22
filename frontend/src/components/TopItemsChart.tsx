import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, Tooltip, Bar } from 'recharts'
import { DashboardSummary } from '../types'

export const TopItemsChart = ({ data }: { data: DashboardSummary['topOutbound'] }) => (
	<div style={{ width: '100%', height: 280 }}>
		<ResponsiveContainer>
			<BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
				<CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
				<XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
				<Tooltip
					contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1f2937' }}
					labelStyle={{ color: '#e2e8f0' }}
					formatter={(value: any) => [value, 'Total Out']}
				/>
				<Bar dataKey="totalOut" fill="#38bdf8" radius={[8, 8, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	</div>
)
