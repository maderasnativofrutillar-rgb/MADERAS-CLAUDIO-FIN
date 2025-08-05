'use client';

import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  strings: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delay?: number;
}

export function TypewriterEffect({
  strings,
  typeSpeed = 100,
  deleteSpeed = 50,
  delay = 2000,
}: TypewriterEffectProps) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(typeSpeed);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % strings.length;
      const fullText = strings[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? deleteSpeed : typeSpeed);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, strings, typeSpeed, deleteSpeed, delay, typingSpeed]);

  return (
    <h2 className="text-accent font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl min-h-[80px] sm:min-h-[100px]">
      {text}
      <span className="animate-pulse">|</span>
    </h2>
  );
}
