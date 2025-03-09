import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import './PuzzleCreator.css';

function PuzzleCreator({ problem, setProblem, puzzlePieces, setPuzzlePieces, onGeneratePuzzle }) {
  const [currentStep, setCurrentStep] = useState('');

  // Add a new step to the puzzle
  const addStep = () => {
    if (!currentStep.trim()) {
      alert('Please enter a step first');
      return;
    }
    
    const newStep = {
      id: `step-${Date.now()}`,
      content: currentStep,
      order: puzzlePieces.length + 1
    };
    
    setPuzzlePieces([...puzzlePieces, newStep]);
    setCurrentStep('');
  };

  // Remove a step from the puzzle
  const removeStep = (id) => {
    const updatedPieces = puzzlePieces.filter(piece => piece.id !== id);
    // Update order of remaining pieces
    const reorderedPieces = updatedPieces.map((piece, index) => ({
      ...piece,
      order: index + 1
    }));
    setPuzzlePieces(reorderedPieces);
  };

  return (
    <div className="puzzle-creator">
      <div className="problem-section">
        <h2>Original Problem</h2>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Enter the original problem statement (supports LaTeX with $ symbols)"
          rows={3}
        />
        <div className="preview">
          <h3>Preview:</h3>
          {problem ? (
            <div className="math-preview">
              <InlineMath math={problem} />
            </div>
          ) : (
            <p>No problem statement yet</p>
          )}
        </div>
      </div>
      
      <div className="steps-section">
        <h2>Proof Steps</h2>
        <div className="step-input">
          <textarea
            value={currentStep}
            onChange={(e) => setCurrentStep(e.target.value)}
            placeholder="Enter a proof step (supports LaTeX with $ symbols)"
            rows={2}
          />
          <button onClick={addStep}>Add Step</button>
        </div>
        
        <Droppable droppableId="steps-creator" direction="vertical">
          {(provided) => (
            <div 
              className="steps-list" 
              ref={provided.innerRef} 
              {...provided.droppableProps}
            >
              {puzzlePieces.length > 0 ? (
                puzzlePieces.map((step, index) => (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided) => (
                      <div
                        className="step-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="step-number">Step {step.order}</div>
                        <div className="step-content">
                          <InlineMath math={step.content} />
                        </div>
                        <button 
                          className="remove-step" 
                          onClick={() => removeStep(step.id)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <p className="no-steps">No steps added yet</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      
      <button 
        className="generate-button" 
        onClick={onGeneratePuzzle}
        disabled={!problem || puzzlePieces.length < 2}
      >
        Generate Puzzle
      </button>
    </div>
  );
}

export default PuzzleCreator; 