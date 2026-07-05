import fs from 'fs';
import path from 'path';

const assetsDir = 'c:/Users/Meet/Music/qr-vault/frontend/dist/assets';
const files = fs.readdirSync(assetsDir);

for (const file of files) {
  if (file.endsWith('.js')) {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Checking ${file}:`);
    if (content.includes('meet-gadhavi')) {
      console.log(`  -> Found 'meet-gadhavi'!`);
    } else {
      console.log(`  -> 'meet-gadhavi' not found`);
    }
    
    if (content.includes('localhost:3000')) {
      console.log(`  -> Found 'localhost:3000'!`);
    } else {
      console.log(`  -> 'localhost:3000' not found`);
    }
  }
}
