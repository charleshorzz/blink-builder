
import React, { useState } from 'react';

interface DropZoneProps {
  id: string;
  onDrop: (componentType: string, zoneId: string) => void;
  children?: React.ReactNode;
  className?: string;
  isEmpty?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ id, onDrop, children, className = '', isEmpty = true }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('component'));
      if (data && data.type) {
        onDrop(data.type, id);
      }
    } catch (err) {
      console.error('Error parsing dropped component data', err);
    }
  };

  return (
    <div 
      className={`
        ${className} 
        ${isOver ? 'drop-highlight' : ''} 
        ${isEmpty ? 'min-h-[100px] border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center' : ''}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isEmpty && !children ? (
        <p className="text-sm text-muted-foreground">Drop a component here</p>
      ) : children}
    </div>
  );
};

export default DropZone;
