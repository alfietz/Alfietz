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
      if (file.endsWith('.vue') || file.endsWith('.css')) {
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

  // Colors and variables replacements
  content = content.replace(/background(-color)?:\s*#FFFFFF;?/gi, 'background: var(--wood-deep);');
  content = content.replace(/background(-color)?:\s*#5D8374;?/gi, 'background: var(--accent-amber);');
  content = content.replace(/background(-color)?:\s*#4A6B5E;?/gi, 'background: var(--wood-polished);');
  content = content.replace(/background(-color)?:\s*#F5F5F5;?/gi, 'background: var(--wood-polished);');
  content = content.replace(/background(-color)?:\s*#F4F8F6;?/gi, 'background: var(--wood-walnut);');
  content = content.replace(/background(-color)?:\s*#F8F8F8;?/gi, 'background: var(--wood-walnut);');
  content = content.replace(/background(-color)?:\s*#F0F0F0;?/gi, 'background: var(--wood-polished);');
  content = content.replace(/background(-color)?:\s*#F4EBE1;?/gi, 'background: var(--wood-walnut);');
  content = content.replace(/background(-color)?:\s*#eaddce;?/gi, 'background: var(--wood-polished);');
  
  content = content.replace(/border(-color)?:\s*1px solid #E1EBE6;?/gi, 'border: 1px solid var(--glass-border);');
  content = content.replace(/border-color:\s*#E1EBE6;?/gi, 'border-color: var(--glass-border);');
  
  content = content.replace(/var\(--bg-white\)/g, 'var(--wood-deep)');
  content = content.replace(/var\(--primary-tan\)/g, 'var(--wood-walnut)');
  content = content.replace(/var\(--text-main\)/g, 'var(--text-primary)');
  content = content.replace(/var\(--secondary-brown\)/g, 'var(--text-primary)');
  content = content.replace(/var\(--border-light\)/g, 'var(--glass-border)');
  
  // Specific old theme names in styles (might be partially mixed)
  content = content.replace(/color:\s*var\(--primary-green\)/g, 'color: var(--text-amber)');
  content = content.replace(/background(-color)?:\s*var\(--primary-green\)/g, 'background: var(--accent-amber)');
  content = content.replace(/border(-color)?:\s*.*var\(--primary-green\)/g, 'border-color: var(--accent-amber)');
  content = content.replace(/color:\s*#666/g, 'color: var(--text-muted)');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated theme variables in: ' + file);
  }
});
