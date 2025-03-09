import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InlineMath } from 'react-katex';

export function SortableCreatorItem({ id, step, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`step-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="step-number">Step {step.order}</div>
      <div className="step-content">
        <InlineMath math={step.content} />
      </div>
      <button 
        className="remove-step" 
        onClick={() => onRemove(id)}
      >
        ×
      </button>
    </div>
  );
} 