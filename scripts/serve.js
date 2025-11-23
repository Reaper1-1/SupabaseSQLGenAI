#!/usr/bin/env node

/**
 * Simple static file server for deployment
 * Serves the built Expo app from static-build directory
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces for deployment
const PUBLIC_DIR = path.join(__dirname, '..', 'static-build');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const mimeType = getMimeType(filePath);
    
    // Add CORS headers for cross-origin requests
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      // Add Expo-specific headers for manifests
      'expo-protocol-version': '1',
      'expo-sfv-version': '0'
    });
    
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, expo-platform',
    });
    res.end();
    return;
  }

  // Parse URL and remove query string
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Security: prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  // Ensure the file path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try to serve index.html for SPA routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (indexErr || !indexStats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          serveFile(res, indexPath);
        }
      });
    } else {
      serveFile(res, filePath);
    }
  });
});

// Ensure static-build directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  console.error(`Error: ${PUBLIC_DIR} directory does not exist.`);
  console.error('Please run the build script first: node scripts/build.js');
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`Static file server running at http://${HOST}:${PORT}`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
  console.log('Press Ctrl+C to stop');
});

// Keep the process alive
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});