#!/usr/bin/env node

import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(appDir, 'dist');
const indexPath = resolve(distDir, 'index.html');
const host = process.env.APP_HOST || '127.0.0.1';
const port = Number.parseInt(process.env.APP_PORT || '3000', 10);
const appName = process.env.APP_NAME || 'journey-frontend';

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.glb', 'model/gltf-binary'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

if (!existsSync(indexPath)) {
  console.error('dist/index.html was not found. Run pnpm build before starting production runtime.');
  process.exit(1);
}

function safePathname(rawUrl = '/') {
  const requestUrl = new URL(rawUrl, 'http://localhost');
  const decodedPathname = decodeURIComponent(requestUrl.pathname);
  const normalizedPathname = normalize(decodedPathname).replace(/^(\.\.(\/|\\|$))+/, '');

  return normalizedPathname === '/' ? '/index.html' : normalizedPathname;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function sendFile(response, filePath, statusCode = 200) {
  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(extension) || 'application/octet-stream';
  const isHtml = extension === '.html';
  const cacheControl = isHtml ? 'no-cache' : 'public, max-age=31536000, immutable';

  response.writeHead(statusCode, {
    'Cache-Control': cacheControl,
    'Content-Type': contentType,
  });

  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';

  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, {
      Allow: 'GET, HEAD',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Method Not Allowed');
    return;
  }

  const pathname = safePathname(request.url);

  if (pathname === '/health') {
    if (method === 'HEAD') {
      response.writeHead(200, { 'Cache-Control': 'no-store' });
      response.end();
      return;
    }

    sendJson(response, 200, {
      app: appName,
      status: 'ok',
    });
    return;
  }

  const requestedFilePath = resolve(join(distDir, pathname.replace(/^\//, '')));
  const isInsideDist = requestedFilePath.startsWith(distDir);

  if (isInsideDist && existsSync(requestedFilePath) && statSync(requestedFilePath).isFile()) {
    if (method === 'HEAD') {
      const extension = extname(requestedFilePath).toLowerCase();
      const contentType = mimeTypes.get(extension) || 'application/octet-stream';
      response.writeHead(200, {
        'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
        'Content-Type': contentType,
      });
      response.end();
      return;
    }

    sendFile(response, requestedFilePath);
    return;
  }

  if (method === 'HEAD') {
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/html; charset=utf-8',
    });
    response.end();
    return;
  }

  try {
    await readFile(indexPath);
    sendFile(response, indexPath);
  } catch {
    response.writeHead(500, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Unable to read frontend bundle.');
  }
});

server.listen(port, host, () => {
  console.log(`${appName} listening at http://${host}:${port}`);
});
