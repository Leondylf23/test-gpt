/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				surface: '#0f172a',
				card: '#111827',
				accent: '#38bdf8',
				muted: '#94a3b8'
			},
			boxShadow: {
				soft: '0 10px 40px rgba(0,0,0,0.25)'
			}
		}
	},
	plugins: []
}
