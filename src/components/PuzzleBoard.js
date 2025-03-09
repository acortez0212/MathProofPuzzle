import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import './PuzzleBoard.css';

function PuzzleBoard({ problem, puzzlePieces, setPuzzlePieces, onReset }) {
  const [connectedPieces, setConnectedPieces] = useState([]);
  const [freePieces, setFreePieces] = useState([]);
  
  // Initialize the board
  useEffect(() => {
    setConnectedPieces([]);
    setFreePieces([...puzzlePieces]);
  }, [puzzlePieces]);

  // Check if a piece can connect to the chain
  const canConnect = (pieceOrder) => {
    if (connectedPieces.length === 0) {
      return pieceOrder === 1; // Only the first step can start the chain
    }
    
    const lastConnectedPiece = connectedPieces[connectedPieces.length - 1];
    return pieceOrder === lastConnectedPiece.order + 1;
  };
  
  // Try to connect a piece to the chain
  const tryConnectPiece = (piece) => {
    if (canConnect(piece.order)) {
      setConnectedPieces([...connectedPieces, piece]);
      setFreePieces(freePieces.filter(p => p.id !== piece.id));
    }
  };
  
  // Release a piece from the chain
  const releasePiece = (piece) => {
    // Can only release the last piece in the chain
    if (piece.id === connectedPieces[connectedPieces.length - 1].id) {
      setConnectedPieces(connectedPieces.filter(p => p.id !== piece.id));
      setFreePieces([...freePieces, piece]);
    }
  };

  // Handle drag end from react-beautiful-dnd
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination, the item was dropped outside a droppable area
    if (!destination) return;
    
    // Find the piece that was dragged
    const draggedPiece = freePieces.find(piece => piece.id === draggableId);
    if (!draggedPiece) return;
    
    // If the destination is the proof chain area and the piece can connect
    if (destination.droppableId === 'proof-chain' && canConnect(draggedPiece.order)) {
      // Add to connected pieces and remove from free pieces
      setConnectedPieces([...connectedPieces, draggedPiece]);
      setFreePieces(freePieces.filter(p => p.id !== draggedPiece.id));
    }
  };

  // Check if the puzzle is solved
  const isPuzzleSolved = () => {
    if (connectedPieces.length !== puzzlePieces.length) return false;
    
    // Check if all pieces are in correct order
    for (let i = 0; i < connectedPieces.length; i++) {
      if (connectedPieces[i].order !== i + 1) return false;
    }
    
    return true;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="puzzle-board">
        <div className="problem-display">
          <div className="problem-card">
            <h3>Original Problem:</h3>
            <div className="problem-content">
              <InlineMath math={problem} />
            </div>
          </div>
        </div>
        
        <Droppable droppableId="proof-chain" direction="vertical">
          {(provided) => (
            <div 
              className="proof-chain"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {connectedPieces.length > 0 ? (
                <div className="connected-pieces">
                  {connectedPieces.map((piece, index) => (
                    <div 
                      key={piece.id} 
                      className="connected-piece"
                      onClick={() => index === connectedPieces.length - 1 && releasePiece(piece)}
                    >
                      <div className="step-number">Step {piece.order}</div>
                      <div className="step-content">
                        <InlineMath math={piece.content} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-chain">
                  <p>Start by connecting Step 1 here</p>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        <Droppable droppableId="free-pieces" direction="vertical">
          {(provided) => (
            <div 
              className="free-pieces-area" 
              ref={provided.innerRef} 
              {...provided.droppableProps}
            >
              {freePieces.map((piece, index) => (
                <Draggable key={piece.id} draggableId={piece.id} index={index}>
                  {(provided) => (
                    <div
                      className="free-piece"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => tryConnectPiece(piece)}
                    >
                      <div className="step-content">
                        <InlineMath math={piece.content} />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        {isPuzzleSolved() && (
          <div className="puzzle-solved">
            <h2>🎉 Puzzle Solved! 🎉</h2>
            <p>Great job! You've correctly arranged all the proof steps.</p>
          </div>
        )}
        
        <div className="board-controls">
          <button onClick={onReset}>Reset / Create New Puzzle</button>
        </div>
      </div>
    </DragDropContext>
  );
}

export default PuzzleBoard; 