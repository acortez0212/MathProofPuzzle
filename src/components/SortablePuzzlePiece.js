import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InlineMath } from 'react-katex';
import './SortablePuzzlePiece.css';

export function SortablePuzzlePiece({
  id,
  piece,
  index,
  isConnectedTop,
  isConnectedBottom,
  isBank = false,
  containerId
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over
  } = useSortable({ 
    id,
    data: {
      type: 'puzzle-piece',
      piece,
      index,
      containerId
    }
  });

  // Base styles for the piece
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  // Check if being dragged over
  const isOver = over?.id === id;

  // Determine classes based on state
  const classNames = [
    'puzzle-piece',
    isDragging ? 'dragging' : '',
    isOver ? 'is-over' : '',
    isConnectedTop ? 'connected-top' : '',
    isConnectedBottom ? 'connected-bottom' : '',
    isBank ? 'bank-piece' : 'solution-piece'
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames}
      data-id={id}
      data-container={containerId}
      {...attributes}
      {...listeners}
    >
      <div className="step-number">Step {piece.order}</div>
      <div className="step-content">
        <InlineMath math={piece.content} />
        {piece.explanation && (
          <div className="step-explanation">
            {piece.explanation}
          </div>
        )}
      </div>
    </div>
  );
} 