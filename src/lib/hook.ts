import { useState, useEffect } from "react";
import { getTopLevelReadableElementsOnPage } from "./parser";

/**
 * Gets bounding boxes for an element. This is implemented for you
 */
export function getElementBounds(elem: HTMLElement) {
  const bounds = elem.getBoundingClientRect();
  const top = bounds.top + window.scrollY;
  const left = bounds.left + window.scrollX;

  return {
    x: left,
    y: top,
    top,
    left,
    width: bounds.width,
    height: bounds.height,
  };
}

/**
 * **TBD:** Implement a function that checks if a point is inside an element
 */
export function isPointInsideElement(
  coordinate: { x: number; y: number },
  element: HTMLElement
): boolean {
  // get bounding rectagle of element
  const bounds = element.getBoundingClientRect();

  // Checking x coordinate for left and right boundaries
  // and y coordinate for top and bottom
  return (coordinate.x >= bounds.left && coordinate.x <= bounds.right) &&
        (coordinate.y >= bounds.top && coordinate.y <= bounds.bottom);
}

/**
 * **TBD:** Implement a function that returns the height of the first line of text in an element
 * We will later use this to size the HTML element that contains the hover player
 */
export function getLineHeightOfFirstLine(element: HTMLElement): number {
  let computedLineHeight = 0;
  let nodeToClone = element;
  
  // Checking first child is text or html element, if html element then consider it to clone that rather than current element
  if(element.firstChild && element.firstChild.nodeName !='#text'){
    nodeToClone = element.firstChild as HTMLElement;
  }

  // Cloning element and adding some text to calculate it roughly by adding quickly on end of body
  const clonedElement = nodeToClone.cloneNode(true) as HTMLElement;
  clonedElement.textContent = 'Sample text';
  
  // Appending to the body
  document.body.appendChild(clonedElement);
  
  // Get fontSize of that element
  computedLineHeight = parseInt(window.getComputedStyle(clonedElement).fontSize);
  
  // Removing from the screen after using it
  clonedElement.remove();

  return computedLineHeight;
}

export type HoveredElementInfo = {
  element: HTMLElement;
  top: number;
  left: number;
  heightOfFirstLine: number;
};

/**
 * **TBD:** Implement a React hook to be used to help to render hover player
 * Return the absolute coordinates on where to render the hover player
 * Returns null when there is no active hovered paragraph
 * Note: If using global event listeners, attach them window instead of document to ensure tests pass
 */
export function useHoveredParagraphCoordinate(
  parsedElements: HTMLElement[]
): HoveredElementInfo | null {
  // Hovered element will stored here on mousemove event
  const [hoveredElementInfo, setHoveredElementInfo] = useState<HoveredElementInfo | null>(null);
  
  useEffect(()=>{
      window.addEventListener('mousemove', (event) => {
        // We need mouse positions to find right rectangular positons from top elements
        const x = event.clientX;
        const y = event.clientY;
        
        // Iterating top elements
        for(const element of parsedElements){
          const boundBox = getElementBounds(element);
          
          // Check x and y position of mouse is inside element or not
          if (isPointInsideElement({x, y}, element)) {
            // Setting element as parent element to show Play button on higher level component
            // Still this logic is rough
            setHoveredElementInfo({
              element: element.parentElement? element.parentElement: element as HTMLElement,
              top: boundBox.top,
              left: boundBox.left - 40, // Move 40 extra to align and not to overlay on text element
              heightOfFirstLine: getLineHeightOfFirstLine(element)
            });
          }
        }
      });
    
  }, [parsedElements]);

  
  

  return hoveredElementInfo;
}
