import { 
  INDENT_SIZE, 
  INDENT_STRING, 
  SUPPORTED_ELEMENTS, 
  KEY_CODES, 
  EVENT_TYPES 
} from './constants';

function handleTabKey(event: KeyboardEvent): void {
  if (event.key !== KEY_CODES.TAB) return;
  
  const target = event.target as HTMLTextAreaElement | HTMLInputElement;
  
  if (!target || !SUPPORTED_ELEMENTS.includes(target.tagName as any)) {
    return;
  }
  
  event.preventDefault();
  
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const value = target.value;
  
  if (start === null || end === null) {
    return;
  }
  
  if (event.shiftKey) {
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(end);
    
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.startsWith(INDENT_STRING)) {
      const newValue = value.substring(0, start - INDENT_SIZE) + afterCursor;
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start - INDENT_SIZE;
    }
  } else {
    const newValue = value.substring(0, start) + INDENT_STRING + value.substring(end);
    target.value = newValue;
    target.selectionStart = target.selectionEnd = start + INDENT_SIZE;
  }
  
  target.dispatchEvent(new Event(EVENT_TYPES.INPUT, { bubbles: true }));
}

document.addEventListener(EVENT_TYPES.KEYDOWN, handleTabKey, true);

console.log('GitHub Tab Indent Extension loaded');