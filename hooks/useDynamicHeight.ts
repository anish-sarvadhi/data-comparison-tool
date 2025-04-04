import { RefObject, useCallback, useEffect, useState } from 'react';

const useDynamicHeight = (targetRef: RefObject<HTMLElement>, offset: number = 0): number => {
  const [height, setHeight] = useState<number>(0);

  const updateHeight = useCallback(() => {
    if (targetRef.current) {
      const containerTopOffset = targetRef.current.getBoundingClientRect().top;
      const availableHeight = window.innerHeight - containerTopOffset - offset;

      setHeight(availableHeight > 0 ? availableHeight : 0);
    }
  }, [targetRef, offset]);

  useEffect(() => {
    const element = targetRef.current;

    if (element) {
      // Create a ResizeObserver to observe the target element
      const resizeObserver = new ResizeObserver(() => updateHeight());

      // Observe the element
      resizeObserver.observe(element);

      // Handle window resize
      const handleWindowResize = () => updateHeight();

      window.addEventListener('resize', handleWindowResize);

      // Initial update
      updateHeight();

      return () => {
        resizeObserver.disconnect(); // Clean up observer
        window.removeEventListener('resize', handleWindowResize); // Clean up resize event
      };
    }
  }, [updateHeight, targetRef]);

  return height;
};

export default useDynamicHeight;
