import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isWide?: boolean;
}

export default function Modal({ isOpen, onClose, children, isWide = false }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const yOffset = window.scrollY;
      const modalTop = yOffset + 100; // 100px from the top of the current viewport
      window.scrollTo({
        top: modalTop,
        behavior: 'smooth'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute z-50 w-full left-0"
      style={{ top: `${window.scrollY}px` }}
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`relative mx-auto mt-[100px] w-full ${isWide ? 'max-w-7xl' : 'max-w-lg'} bg-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}