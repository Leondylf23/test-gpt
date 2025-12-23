import { CssBaseline, LinearProgress, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/AppLayout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuditLogPage } from './pages/AuditLogPage'
import { DashboardPage } from './pages/DashboardPage'
import { ItemManagementPage } from './pages/ItemManagementPage'
import { LoginPage } from './pages/LoginPage'
import { StockManagementPage } from './pages/StockManagementPage'
import { StorageManagementPage } from './pages/StorageManagementPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { theme } from './theme'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { user, loading } = useAuth()
	if (loading) return <LinearProgress />
	if (!user) return <Navigate to="/login" replace />
	return <>{children}</>
}

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/login" element={<LoginPage />} />
						<Route
							element={
								<ProtectedRoute>
									<AppLayout />
								</ProtectedRoute>
							}
						>
							<Route path="/" element={<DashboardPage />} />
							<Route path="/stocks" element={<StockManagementPage />} />
							<Route path="/items" element={<ItemManagementPage />} />
							<Route path="/storage" element={<StorageManagementPage />} />
							<Route path="/transactions" element={<TransactionsPage />} />
							<Route path="/users" element={<UserManagementPage />} />
							<Route path="/audit" element={<AuditLogPage />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</ThemeProvider>
	)
}

export default App
