
import React from 'react';

interface TemplateImageProps {
  imageUrl: string;
  title: string;
  className?: string;
}

const TemplateImage: React.FC<TemplateImageProps> = ({ imageUrl, title, className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className} transform transition-all duration-500 hover:scale-105`}>
      <img 
        src={imageUrl} 
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export default TemplateImage;
