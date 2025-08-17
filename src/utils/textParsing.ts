
export const parseBulletPoints = (text: string): string[] => {
  if (!text) return [];
  
  // Split by newlines and filter out empty lines
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map((line) => {
    // Remove bullet symbols and extra whitespace
    const cleanLine = line.replace(/^[●\t\s]+/, '').trim();
    return cleanLine;
  }).filter(line => line.length > 0);
};
