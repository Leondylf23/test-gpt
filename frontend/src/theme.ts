import { createTheme } from '@mui/material'

export const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: { main: '#38bdf8' },
		background: { default: '#0b1222', paper: '#0f172a' }
	},
	shape: { borderRadius: 14 },
	typography: {
		fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
		h6: { fontWeight: 700 }
	},
	components: {
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundColor: '#0f172a',
					border: '1px solid #1f2937'
				}
			}
		}
	}
})
