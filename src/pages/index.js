import { useState, useEffect } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import dynamic from 'next/dynamic'

// Import components with SSR disabled
const PuzzleCreator = dynamic(() => import('../components/PuzzleCreator'), {
  ssr: false,
})
const PuzzleBoard = dynamic(() => import('../components/PuzzleBoard'), {
  ssr: false,
})
const LLMPuzzleCreator = dynamic(() => import('../components/LLMPuzzleCreator'), {
  ssr: false,
})

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [puzzlePieces, setPuzzlePieces] = useState([])
  const [problem, setProblem] = useState('')
  const [currentView, setCurrentView] = useState('home') // 'home', 'manual', 'llm', 'puzzle'
  
  // Only run on client-side
  useEffect(() => {
    setIsClient(true)
    console.log('Current view:', currentView)
  }, [currentView])

  // Function to generate a puzzle from the steps
  const generatePuzzle = () => {
    console.log('generatePuzzle called. Problem:', problem, 'Puzzle pieces:', puzzlePieces);
    
    if (!problem || !problem.trim() || !puzzlePieces || puzzlePieces.length === 0) {
      console.log('Missing problem or pieces. Problem empty:', !problem || !problem.trim(), 'Pieces empty:', !puzzlePieces || puzzlePieces.length === 0);
      alert('Please add a problem and at least one step');
      return;
    }
    
    try {
      // Make a deep copy of the puzzle pieces to avoid reference issues
      const piecesToShuffle = JSON.parse(JSON.stringify(puzzlePieces));
      
      // Shuffle the pieces for the puzzle
      const shuffledPieces = piecesToShuffle.sort(() => Math.random() - 0.5);
      console.log('Shuffled pieces:', shuffledPieces);
      
      // Update state and change view
      setPuzzlePieces(shuffledPieces);
      
      // Small delay to ensure state is updated before changing view
      setTimeout(() => {
        console.log('Changing view to puzzle');
        setCurrentView('puzzle');
      }, 100);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      alert('There was an error generating the puzzle. Please try again.');
    }
  }
  
  // Function to handle drag end events
  const handleDragEnd = (result) => {
    if (!isClient) return
    
    const { destination, source } = result
    
    // If there's no destination or the item was dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return
    }
    
    // Create a new array of pieces
    const newPieces = [...puzzlePieces]
    const [movedItem] = newPieces.splice(source.index, 1)
    newPieces.splice(destination.index, 0, movedItem)
    
    setPuzzlePieces(newPieces)
  }
  
  // Reset to home screen
  const resetToHome = () => {
    // Clear any existing puzzle data
    setPuzzlePieces([])
    setProblem('')
    setCurrentView('home')
  }
  
  // Render the home screen
  const renderHomeScreen = () => (
    <div className="home-screen">
      <h2>Choose Puzzle Creation Method</h2>
      <div className="creation-options">
        <button onClick={() => setCurrentView('manual')}>
          Create Puzzle Manually
        </button>
        <button onClick={() => setCurrentView('llm')}>
          Generate Puzzle with AI
        </button>
      </div>
    </div>
  )

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Math Proof Puzzle</h1>
        {currentView !== 'home' && (
          <button className="back-to-home" onClick={resetToHome}>
            Back to Home
          </button>
        )}
      </header>
      <main className="app-main">
        <DragDropContext onDragEnd={handleDragEnd}>
          {currentView === 'home' && renderHomeScreen()}
          
          {currentView === 'manual' && (
            <PuzzleCreator 
              problem={problem}
              setProblem={setProblem}
              puzzlePieces={puzzlePieces}
              setPuzzlePieces={setPuzzlePieces}
              onGeneratePuzzle={generatePuzzle}
            />
          )}
          
          {currentView === 'llm' && (
            <LLMPuzzleCreator 
              setProblem={setProblem}
              setPuzzlePieces={setPuzzlePieces}
              onGeneratePuzzle={generatePuzzle}
            />
          )}
          
          {currentView === 'puzzle' && (
            <PuzzleBoard 
              problem={problem}
              puzzlePieces={puzzlePieces}
              setPuzzlePieces={setPuzzlePieces}
              onReset={resetToHome}
            />
          )}
        </DragDropContext>
      </main>
    </div>
  )
} 