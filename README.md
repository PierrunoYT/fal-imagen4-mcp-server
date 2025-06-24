# FAL Imagen 4 MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io/)
[![FAL AI](https://img.shields.io/badge/FAL%20AI-Imagen%204%20Ultra-green)](https://fal.ai/)

A Model Context Protocol (MCP) server that provides access to Google's Imagen 4 Ultra model through the FAL AI platform. This server enables high-quality image generation with enhanced detail, richer lighting, and fewer artifacts.

**🔗 Repository**: [https://github.com/PierrunoYT/fal-imagen4-mcp-server](https://github.com/PierrunoYT/fal-imagen4-mcp-server)

> **🚀 Ready to use!** Pre-built executable included - no compilation required.

## Features

- **High-Quality Image Generation**: Uses Google's Imagen 4 Ultra model
- **Multiple Aspect Ratios**: Support for 1:1, 16:9, 9:16, 3:4, and 4:3
- **Batch Generation**: Generate up to 4 images at once
- **Reproducible Results**: Optional seed parameter for consistent outputs
- **Async Support**: Both real-time and queue-based generation methods
- **Negative Prompts**: Specify what to avoid in generated images

## Prerequisites

- Node.js 18 or higher
- FAL AI API key

## Installation

1. **Get your FAL AI API Key**:
   - Visit [FAL AI](https://fal.ai/)
   - Sign up for an account
   - Navigate to your dashboard
   - Generate an API key

2. **The server is already built and ready to use** (build folder contains the compiled JavaScript)

## Configuration

### For Kilo Code MCP Settings

Add the server to your MCP settings file at:
`C:\Users\[username]\AppData\Roaming\Kilo-Code\MCP\settings\mcp_settings.json`

```json
{
  "mcpServers": {
    "fal-imagen4": {
      "command": "node",
      "args": ["D:/Projects2/Imagen4MCP/build/index.js"],
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "fal-imagen4": {
      "command": "node",
      "args": ["d:/Projects2/Imagen4MCP/build/index.js"],
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      }
    }
  }
}
```

## Available Tools

### `imagen4_generate`

Generate images using Imagen 4 Ultra with real-time processing.

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `negative_prompt` (optional): What to avoid in the image
- `aspect_ratio` (optional): "1:1", "16:9", "9:16", "3:4", or "4:3" (default: "1:1")
- `num_images` (optional): Number of images to generate, 1-4 (default: 1)
- `seed` (optional): Random seed for reproducible generation

**Example usage:**
```
Generate an image of a sunset over mountains with aspect ratio 16:9
```

### `imagen4_generate_async`

Generate images using Imagen 4 Ultra with async queue processing for longer requests.

**Parameters:** Same as `imagen4_generate`

**Use this tool when:**
- Generating multiple images
- Complex prompts that might take longer
- When the regular tool times out

## Example Prompts

- "A photorealistic image of a golden retriever playing in a field of sunflowers"
- "A minimalist logo design for a tech startup, clean lines, blue and white color scheme"
- "An oil painting style portrait of a wise old wizard with a long beard"
- "A futuristic cityscape at night with neon lights and flying cars"

## API Costs

This server uses the FAL AI platform, which charges per image generation. Check [FAL AI pricing](https://fal.ai/pricing) for current rates.

## Troubleshooting

### Server not appearing in MCP client
1. Check that the path to `build/index.js` is correct and absolute
2. Verify your FAL_KEY is set correctly in the environment variables
3. Restart your MCP client (Claude Desktop, Kilo Code, etc.)

### Image generation failing
1. Verify your FAL API key is valid and has sufficient credits
2. Check that your prompt follows FAL AI's content policy
3. Try reducing the number of images or simplifying the prompt

### Build issues
If you need to rebuild the server:
```bash
npm run build
```

## Development

To modify the server:

1. Edit files in the `src/` directory
2. Run `npm run build` to compile
3. Restart your MCP client to use the updated server

## Support

For issues with:
- **This MCP server**: Create an issue in this repository
- **FAL AI API**: Check [FAL AI documentation](https://fal.ai/docs)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)