import '../styles/globals.css'
import dynamic from 'next/dynamic'

// Import components with SSR disabled
const PuzzleCreator = dynamic(() => import('../components/PuzzleCreator'), {
  ssr: false,
})
const PuzzleBoard = dynamic(() => import('../components/PuzzleBoard'), {
  ssr: false,
})

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp 