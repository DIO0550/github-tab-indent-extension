import { SUPPORTED_ELEMENTS, type SupportedElement } from "./constants";

export type EditableElement = HTMLTextAreaElement | HTMLInputElement;

function hasSelectionCapability(element: HTMLElement): element is EditableElement {
  if (!(element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement)) {
    return false;
  }
  
  return (
    element.selectionStart !== undefined && 
    element.selectionStart !== null &&
    element.selectionEnd !== undefined && 
    element.selectionEnd !== null
  );
}

function isSupportedElement(tagName: string): tagName is SupportedElement {
  return SUPPORTED_ELEMENTS.includes(tagName as SupportedElement);
}

export function isValidTextArea(
  target: EventTarget | undefined
): target is EditableElement {
  if (!target) {
    return false;
  }
  
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  
  const tagName = target.tagName;
  
  if (!isSupportedElement(tagName)) {
    return false;
  }
  
  return hasSelectionCapability(target);
}

export function getTextAreaElement(
  event: KeyboardEvent
): EditableElement | undefined {
  const target = event.target ?? undefined;
  
  if (isValidTextArea(target)) {
    return target;
  }
  
  return undefined;
}