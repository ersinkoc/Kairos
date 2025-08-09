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
  
  // Default to index.html in browser-test directory
  if (filePath === '/') {
    filePath = '/browser-test/index.html';
  }
  
  // Serve from project root
  filePath = path.join(__dirname, filePath);
  
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
  console.log(`  • http://localhost:${PORT}/browser-test/index.html - Browser compatibility test`);
  console.log(`  • http://localhost:${PORT}/browser-test/full-test.html - Full test suite`);
  console.log(`\n✅ Open the URLs in your browser to run tests`);
  console.log(`Press Ctrl+C to stop the server\n`);
});