const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.map': 'application/json'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL
  let filePath = req.url;
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Handle parent directory references for dist files
  if (filePath.startsWith('/..')) {
    // Remove the /.. and resolve from parent directory
    filePath = path.resolve(__dirname, '..', filePath.substring(3));
  } else {
    // Resolve normally within browser-test directory
    filePath = path.resolve(__dirname, '.' + filePath);
  }
  
  // Security check - ensure we're serving from the project directory
  const projectRoot = path.resolve(__dirname, '..');
  if (!filePath.startsWith(projectRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read and serve file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end(`Server error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Kairos Browser Test Server`);
  console.log(`================================`);
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`\n📋 Available tests:`);
  console.log(`  • http://localhost:${PORT}/index.html - Browser compatibility test`);
  console.log(`\n✅ Open the URL in your browser to run tests`);
  console.log(`Press Ctrl+C to stop the server\n`);
});