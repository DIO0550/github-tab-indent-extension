function handleTabKey(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  
  const target = event.target as HTMLTextAreaElement | HTMLInputElement;
  
  if (!target || !['TEXTAREA', 'INPUT'].includes(target.tagName)) {
    return;
  }
  
  event.preventDefault();
  
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const value = target.value;
  
  if (event.shiftKey) {
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(end);
    
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (currentLine.startsWith('  ')) {
      const newValue = value.substring(0, start - 2) + afterCursor;
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start - 2;
    }
  } else {
    const newValue = value.substring(0, start) + '  ' + value.substring(end);
    target.value = newValue;
    target.selectionStart = target.selectionEnd = start + 2;
  }
  
  target.dispatchEvent(new Event('input', { bubbles: true }));
}

document.addEventListener('keydown', handleTabKey, true);

console.log('GitHub Tab Indent Extension loaded');