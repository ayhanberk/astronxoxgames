const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Try to load .env.local first, then .env
const loadEnv = (filePath) => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/); // Handle both CRLF and LF
    lines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
};

const projectRoot = path.join(__dirname, '..');
loadEnv(path.join(projectRoot, '.env.local'));
loadEnv(path.join(projectRoot, '.env'));

const port = process.env.PORT || 3000;
const isWindows = process.platform === 'win32';
const nextCmd = isWindows ? 'npx.cmd' : 'npx';

console.log(`> Starting Next.js dev server on port ${port} from .env...`);

const child = spawn(nextCmd, ['next', 'dev', '-p', port], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
  env: { ...process.env }
});

child.on('error', (err) => {
  console.error('Failed to start subprocess:', err);
});
