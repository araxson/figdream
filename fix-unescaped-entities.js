const fs = require('fs');
const path = require('path');

// Function to escape HTML entities in TSX/JSX files
function escapeEntities(content) {
  // Replace apostrophes that are not already escaped
  content = content.replace(/(>|^)([^<]*?)([^&])'/g, (match, p1, p2, p3) => {
    // Don't replace if it's in a code block or attribute
    if (match.includes('`') || match.includes('=')) return match;
    return p1 + p2 + p3 + '&apos;';
  });

  // Replace quotes that are not already escaped  
  content = content.replace(/(>|^)([^<]*?)([^&])"/g, (match, p1, p2, p3) => {
    // Don't replace if it's in a code block or attribute
    if (match.includes('`') || match.includes('=')) return match;
    return p1 + p2 + p3 + '&quot;';
  });

  return content;
}

// Function to process a file
function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = escapeEntities(content);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  return false;
}

// Function to recursively process directory
function processDirectory(dir) {
  let count = 0;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      count += processDirectory(fullPath);
    } else if (stat.isFile()) {
      if (processFile(fullPath)) {
        console.log(`Fixed: ${fullPath}`);
        count++;
      }
    }
  }
  
  return count;
}

// Main execution
const srcPath = path.join(__dirname, 'src');
console.log('Fixing unescaped entities in JSX/TSX files...');
const fixedCount = processDirectory(srcPath);
console.log(`Fixed ${fixedCount} files`);