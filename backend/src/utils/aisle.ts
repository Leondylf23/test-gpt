const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const toLetters = (index: number) => {
	let n = index
	let label = ''
	while (n >= 0) {
		label = alphabet[n % 26] + label
		n = Math.floor(n / 26) - 1
	}
	return label.padStart(2, 'A')
}

export const generateAisleId = (floor: number, room: number, aisleIndex: number) => {
	const letters = toLetters(Math.floor(aisleIndex / 100))
	const numbers = String((aisleIndex % 100) + 1).padStart(2, '0')
	const aisleCode = `${letters}${numbers}`
	const floorCode = String(floor + 1).padStart(3, '0')
	const roomCode = String(room + 1).padStart(4, '0')
	return `${floorCode}/${roomCode}/${aisleCode}`
}
