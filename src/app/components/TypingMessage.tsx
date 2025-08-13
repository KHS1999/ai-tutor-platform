'use client';

import React, { useState, useEffect } from 'react';

interface TypingMessageProps {
  text: string;
  onComplete?: () => void;
}

const TypingMessage: React.FC<TypingMessageProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 20); // Adjust typing speed here (milliseconds per character)

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [text, currentIndex, onComplete]);

  return <>{displayedText}</>;
};

export default TypingMessage;
