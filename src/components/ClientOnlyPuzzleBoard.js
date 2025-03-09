import dynamic from 'next/dynamic'
import PuzzleBoard from './PuzzleBoard'

// This component will only be loaded on the client side
const ClientOnlyPuzzleBoard = dynamic(() => import('./PuzzleBoard'), {
  ssr: false,
})

export default ClientOnlyPuzzleBoard 