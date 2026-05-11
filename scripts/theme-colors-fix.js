import fs from 'fs';
import path from 'path';

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.vue')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/background(-color)?:\s*#140C08;?/gi, 'background: var(--input-bg);');

  // Text Colors
  content = content.replace(/color:\s*#1A1A1A;?/gi, 'color: var(--text-primary);');
  content = content.replace(/color:\s*#333;?/gi, 'color: var(--text-primary);');
  content = content.replace(/color:\s*#5D4037;?/gi, 'color: var(--text-primary);');
  content = content.replace(/color:\s*#FFFBEB;?/gi, 'color: var(--text-primary);');
  content = content.replace(/color:\s*#F9F3EE;?/gi, 'color: var(--text-primary);');
  
  content = content.replace(/color:\s*#888888;?/gi, 'color: var(--text-muted);');
  content = content.replace(/color:\s*#A0A0A0;?/gi, 'color: var(--text-muted);');
  content = content.replace(/color:\s*#555555;?/gi, 'color: var(--text-muted);');
  content = content.replace(/color:\s*#6D4C41;?/gi, 'color: var(--text-muted);');
  content = content.replace(/color:\s*#5A3D2B;?/gi, 'color: var(--input-placeholder);');
  
  content = content.replace(/color:\s*#5D8374;?/gi, 'color: var(--text-amber);');
  content = content.replace(/color:\s*#FFFFFF;?/gi, 'color: white;');
  
  // Borders
  content = content.replace(/border-color:\s*#5D8374;?/gi, 'border-color: var(--accent-amber);');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated colors in: ' + file);
  }
});
