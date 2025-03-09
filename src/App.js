import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import PuzzleBoard from './components/PuzzleBoard';
import PuzzleCreator from './components/PuzzleCreator';
import LLMPuzzleCreator from './components/LLMPuzzleCreator';
import './App.css';

function App() {
  // Force home view on initial load
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [problem, setProblem] = useState('');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'manual', 'llm', 'puzzle'
  
  // Log the current view for debugging
  useEffect(() => {
    console.log('Current view:', currentView);
  }, [currentView]);
  
  // Function to generate a puzzle from the steps
  const generatePuzzle = () => {
    if (!problem || puzzlePieces.length === 0) {
      alert('Please add a problem and at least one step');
      return;
    }
    
    // Shuffle the pieces for the puzzle
    const shuffledPieces = [...puzzlePieces].sort(() => Math.random() - 0.5);
    setPuzzlePieces(shuffledPieces);
    setCurrentView('puzzle');
  };
  
  // Function to handle drag end events
  const handleDragEnd = (result) => {
    const { destination, source } = result;
    
    // If there's no destination or the item was dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Create a new array of pieces
    const newPieces = [...puzzlePieces];
    const [movedItem] = newPieces.splice(source.index, 1);
    newPieces.splice(destination.index, 0, movedItem);
    
    setPuzzlePieces(newPieces);
  };
  
  // Reset to home screen
  const resetToHome = () => {
    // Clear any existing puzzle data
    setPuzzlePieces([]);
    setProblem('');
    setCurrentView('home');
  };
  
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
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
        </main>
      </div>
    </DragDropContext>
  );
}

export default App; 