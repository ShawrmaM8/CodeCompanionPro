#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the routes file
const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
let content = fs.readFileSync(routesPath, 'utf8');

// Fix all the type annotations
const fixes = [
  // Fix all route handlers to have Response type
  { from: /async \(req: AuthenticatedRequest, res\) =>/g, to: 'async (req: AuthenticatedRequest, res: Response) =>' },
  { from: /async \(req, res\) =>/g, to: 'async (req: Request, res: Response) =>' },
  { from: /\(req, res\) =>/g, to: '(req: Request, res: Response) =>' },
  
  // Fix process references
  { from: /process\.env\./g, to: 'process.env.' },
];

// Apply fixes
fixes.forEach(fix => {
  content = content.replace(fix.from, fix.to);
});

// Write back the fixed content
fs.writeFileSync(routesPath, content);

console.log('✅ Fixed all TypeScript type annotations in routes.ts');
