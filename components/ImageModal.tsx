import React from 'react';
import { ProcessedImage } from '../types';

interface ImageModalProps {
  image: ProcessedImage | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-screen w-full flex items-center justify-center">
        <img
          src={image.dataUrl}
          alt="Zoomed Card"
          className="max-h-[90vh] max-w-full rounded-lg shadow-2xl border-4 border-xmas-gold object-contain"
          onClick={(e) => e.stopPropagation()} 
        />
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-xmas-gold font-bold text-xl p-2 bg-xmas-red rounded-full w-10 h-10 flex items-center justify-center border-2 border-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ImageModal;