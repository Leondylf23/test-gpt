import { AppBar, Avatar, Box, Button, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import SecurityIcon from '@mui/icons-material/Security'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
	{ to: '/', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
	{ to: '/stocks', label: 'Stock', icon: <InventoryIcon fontSize="small" /> },
	{ to: '/items', label: 'Items', icon: <ReceiptLongIcon fontSize="small" /> },
	{ to: '/storage', label: 'Storage', icon: <WarehouseIcon fontSize="small" /> },
	{ to: '/transactions', label: 'Transactions', icon: <ReceiptLongIcon fontSize="small" /> },
	{ to: '/users', label: 'Users', icon: <PeopleAltIcon fontSize="small" /> },
	{ to: '/audit', label: 'Audit', icon: <SecurityIcon fontSize="small" /> }
]

export const AppLayout = () => {
	const { logout, user } = useAuth()
	const location = useLocation()

	return (
		<Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr', bgcolor: 'transparent' }}>
			<AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)', borderBottom: '1px solid #1f2937' }}>
				<Toolbar sx={{ display: 'flex', gap: 2 }}>
					<MenuIcon />
					<Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
						Warehouse OS
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
						{links.map((link) => (
							<Button
								key={link.to}
								component={NavLink}
								to={link.to}
								color="inherit"
								startIcon={link.icon}
								sx={{
									color: location.pathname === link.to ? '#38bdf8' : '#cbd5e1',
									'&.active': { color: '#38bdf8', bgcolor: 'rgba(56,189,248,0.08)' },
									textTransform: 'none'
								}}
							>
								{link.label}
							</Button>
						))}
					</Box>
					<Box sx={{ marginLeft: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
						<Box sx={{ textAlign: 'right' }}>
							<Typography variant="body2" color="text.secondary">
								{user?.role ?? 'guest'}
							</Typography>
							<Typography variant="subtitle2">{user?.name}</Typography>
						</Box>
						<Avatar sx={{ bgcolor: '#38bdf8', color: '#0b1222' }}>{user?.name?.[0] ?? '?'}</Avatar>
						<Button variant="outlined" color="inherit" onClick={logout}>
							Log out
						</Button>
					</Box>
				</Toolbar>
			</AppBar>
			<Box sx={{ padding: '32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
				<Outlet />
			</Box>
		</Box>
	)
}
