#!/usr/bin/env node

// Simple script to get the absolute path for MCP configuration
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.log('=== FAL Imagen 4 MCP Server Configuration ===\n');
console.log('Server executable path:');
console.log(serverPath);
console.log('\nCopy this path to your MCP configuration:\n');

const config = {
  "mcpServers": {
    "fal-imagen4": {
      "command": "node",
      "args": [serverPath],
      "env": {
        "FAL_KEY": "YOUR_FAL_API_KEY_HERE"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
};

console.log(JSON.stringify(config, null, 2));
console.log('\n=== Instructions ===');
console.log('1. Get your FAL API key from https://fal.ai/');
console.log('2. Replace "YOUR_FAL_API_KEY_HERE" with your actual API key');
console.log('3. Add this configuration to your MCP settings file');
console.log('4. Restart your MCP client');