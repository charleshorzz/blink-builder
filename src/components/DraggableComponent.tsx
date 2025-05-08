
import React from 'react';
import { Card } from '@/components/ui/card';

interface DraggableComponentProps {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ id, type, label, icon }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('component', JSON.stringify({ id, type }));
    e.currentTarget.classList.add('component-dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('component-dragging');
  };

  return (
    <Card 
      className="p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="text-builder-primary">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Card>
  );
};

export default DraggableComponent;
