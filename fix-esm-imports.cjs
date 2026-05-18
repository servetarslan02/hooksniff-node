const fs = require('fs');
const path = require('path');

function fix(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fix(full);
    } else if (entry.name.endsWith('.js')) {
      let content = fs.readFileSync(full, 'utf8');
      // Add .js extension to relative imports that don't already have it
      content = content.replace(
        /from\s+['"](\.\.?\/[^'"]+)['"]/g,
        (match, importPath) => {
          if (importPath.endsWith('.js') || importPath.endsWith('.json')) return match;
          return match.replace(importPath, importPath + '.js');
        }
      );
      fs.writeFileSync(full, content);
    }
  }
}

fix('./dist/esm');
console.log('Fixed ESM import paths');
