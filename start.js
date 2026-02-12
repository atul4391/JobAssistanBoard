import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Job Board Assistant...');

// Start Backend
const backend = spawn('node', ['server/server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

backend.on('error', (err) => {
    console.error('Failed to start backend server:', err);
});

// Start Frontend
const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

frontend.on('error', (err) => {
    console.error('Failed to start frontend server:', err);
});

// Handle exit
process.on('SIGINT', () => {
    console.log('Stopping servers...');
    backend.kill();
    frontend.kill();
    process.exit();
});
