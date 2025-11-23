// Simple backend starter script
const { spawn } = require('child_process');

console.log('Starting Better Man Project Backend Server...');

// Start the backend server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: 3001,
    NODE_ENV: 'development'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});