# FAL Imagen 4 MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io/)
[![FAL AI](https://img.shields.io/badge/FAL%20AI-Imagen%204%20Ultra-green)](https://fal.ai/)

A Model Context Protocol (MCP) server that provides access to Google's Imagen 4 Ultra model through the FAL AI platform. This server enables high-quality image generation with enhanced detail, richer lighting, and fewer artifacts.

**🔗 Repository**: [https://github.com/PierrunoYT/fal-imagen4-mcp-server](https://github.com/PierrunoYT/fal-imagen4-mcp-server)

> **⚠️ Current Status**: The Imagen 4 Ultra model endpoint (`fal-ai/imagen4/preview/ultra`) is currently returning "Unprocessable Entity" errors. This may be due to the model being in preview status with restricted access or API changes. The server code is functional and ready to use once the API issue is resolved.

> **🚀 Ready to use!** Pre-built executable included - no compilation required.
>
> **✅ Enhanced Reliability**: Server now handles missing API keys gracefully without crashes and includes robust error handling.

## Features

- **High-Quality Image Generation**: Uses Google's Imagen 4 Ultra model via FAL AI
- **Automatic Image Download**: Generated images are automatically saved to local `images` directory
- **Multiple Aspect Ratios**: Support for 1:1, 16:9, 9:16, 3:4, and 4:3
- **Batch Generation**: Generate up to 4 images at once
- **Reproducible Results**: Optional seed parameter for consistent outputs
- **Dual Generation Methods**: Both real-time and async queue-based generation
- **Negative Prompts**: Specify what to avoid in generated images
- **Detailed Responses**: Returns both local file paths and original URLs with metadata
- **Robust Error Handling**: Graceful handling of missing API keys without server crashes
- **Universal Portability**: Works anywhere with npx - no local installation required
- **Enhanced Reliability**: Graceful shutdown handlers and comprehensive error reporting

## Prerequisites

- Node.js 18 or higher
- FAL AI API key

## Installation

### 1. Get your FAL AI API Key

- Visit [FAL AI](https://fal.ai/)
- Sign up for an account
- Navigate to your dashboard
- Generate an API key

### 2. Clone or Download

```bash
git clone https://github.com/PierrunoYT/fal-imagen4-mcp-server.git
cd fal-imagen4-mcp-server
```

### 3. Install Dependencies (Optional)

The server is pre-built, but if you want to modify it:

```bash
npm install
npm run build
```

## Configuration

### 🚀 Recommended: Universal npx Configuration (Works Everywhere)

**Best option for portability** - works on any machine with Node.js:

```json
{
  "mcpServers": {
    "fal-imagen4": {
      "command": "npx",
      "args": [
        "-y",
        "https://github.com/PierrunoYT/fal-imagen4-mcp-server.git"
      ],
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      }
    }
  }
}
```

**Benefits:**
- ✅ **Universal Access**: Works on any machine with Node.js
- ✅ **No Local Installation**: npx downloads and runs automatically
- ✅ **Always Latest Version**: Pulls from GitHub repository
- ✅ **Cross-Platform**: Windows, macOS, Linux compatible
- ✅ **Settings Sync**: Works everywhere you use your MCP client

### Alternative: Local Installation

If you prefer to install locally, use the path helper:

```bash
npm run get-path
```

This will output the complete MCP configuration with the correct absolute path.

#### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "fal-imagen4": {
      "command": "node",
      "args": ["path/to/fal-imagen4-mcp-server/build/index.js"],
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      }
    }
  }
}
```

#### For Kilo Code MCP Settings

Add to your MCP settings file at:
`C:\Users\[username]\AppData\Roaming\Kilo-Code\MCP\settings\mcp_settings.json`

```json
{
  "mcpServers": {
    "fal-imagen4": {
      "command": "node",
      "args": ["path/to/fal-imagen4-mcp-server/build/index.js"],
      "env": {
        "FAL_KEY": "your-fal-api-key-here"
      },
      "disabled": false,
      "alwaysAllow": []
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

**Response includes:**
- Image URLs for immediate access
- Generation metadata (seed, request ID)
- File information (content type, size)

### `imagen4_generate_async`

Generate images using Imagen 4 Ultra with async queue processing for longer requests.

**Parameters:** Same as `imagen4_generate`

**Use this tool when:**
- Generating multiple images (2-4)
- Complex prompts that might take longer
- When the regular tool times out
- For batch processing workflows

**Features:**
- Queue-based processing with status polling
- 5-minute timeout with progress updates
- Detailed logging of generation progress

## 📥 **How Image Download Works**

The FAL Imagen 4 MCP server automatically downloads generated images to your local machine. Here's the complete process:

### **1. Image Generation Flow**
1. **API Call**: Server calls FAL AI's Imagen 4 Ultra API
2. **Response**: FAL returns temporary URLs for generated images
3. **Auto-Download**: Server immediately downloads images to local storage
4. **Response**: Returns both local paths and original URLs

### **2. Download Implementation**

#### **Download Function** ([`downloadImage`](src/index.ts:37-71)):
```typescript
async function downloadImage(url: string, filename: string): Promise<string> {
  // 1. Parse the URL and determine HTTP/HTTPS client
  const parsedUrl = new URL(url);
  const client = parsedUrl.protocol === 'https:' ? https : http;
  
  // 2. Create 'images' directory if it doesn't exist
  const imagesDir = path.join(process.cwd(), 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // 3. Create file write stream
  const filePath = path.join(imagesDir, filename);
  const file = fs.createWriteStream(filePath);
  
  // 4. Download and pipe to file
  client.get(url, (response) => {
    response.pipe(file);
    // Handle completion and errors
  });
}
```

#### **Filename Generation** ([`generateImageFilename`](src/index.ts:74-82)):
```typescript
function generateImageFilename(prompt: string, index: number, seed: number): string {
  // Creates safe filename: imagen4_prompt_seed_index_timestamp.png
  const safePrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, '_')         // Replace spaces with underscores
    .substring(0, 50);            // Limit length
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `imagen4_${safePrompt}_${seed}_${index}_${timestamp}.png`;
}
```

### **3. Download Process in Action**

#### **During Image Generation** (both sync and async tools):
```typescript
// After FAL API returns image URLs:
console.error("Downloading images locally...");
const downloadedImages = [];

for (let i = 0; i < result.data.images.length; i++) {
  const img = result.data.images[i];
  const filename = generateImageFilename(prompt, i + 1, result.data.seed);
  
  try {
    const localPath = await downloadImage(img.url, filename);
    downloadedImages.push({
      url: img.url,        // Original FAL URL
      localPath,           // Local file path
      index: i + 1         // Image number
    });
    console.error(`Downloaded: ${filename}`);
  } catch (downloadError) {
    // Graceful fallback - still provides original URL
  }
}
```

### **4. File Storage Details**

#### **Directory Structure:**
```
your-project/
├── images/                    # Auto-created directory
│   ├── imagen4_mountain_landscape_123456_1_2025-06-24T18-30-45-123Z.png
│   ├── imagen4_cute_robot_789012_1_2025-06-24T18-31-20-456Z.png
│   └── ...
```

#### **Filename Format:**
- **Prefix**: `imagen4_`
- **Prompt**: First 50 chars, sanitized (alphanumeric + underscores)
- **Seed**: Random seed used for generation
- **Index**: Image number (for multiple images)
- **Timestamp**: ISO timestamp for uniqueness
- **Extension**: `.png`

### **5. Response Format**

The server returns both local and remote information:
```
Successfully generated 1 image(s) using Imagen 4 Ultra:

Prompt: "a serene mountain landscape"
Negative Prompt: "None"
Aspect Ratio: 1:1
Seed: 1234567890
Request ID: req_abc123

Generated Images:
Image 1:
  Local Path: /path/to/project/images/imagen4_a_serene_mountain_landscape_1234567890_1_2025-06-24T18-30-45-123Z.png
  Original URL: https://v3.fal.media/files/...

Images have been downloaded to the local 'images' directory.
```

### **6. Error Handling**

- **Download Failures**: Server continues and provides original URL
- **Directory Creation**: Auto-creates `images` folder if missing
- **File Conflicts**: Timestamp ensures unique filenames
- **Network Issues**: Graceful fallback with error messages

### **7. Benefits of Local Download**

✅ **Persistent Storage**: Images saved locally, not just temporary URLs
✅ **Offline Access**: View images without internet connection
✅ **Organized Storage**: All images in dedicated `images` directory
✅ **Unique Naming**: No filename conflicts with timestamp system
✅ **Fallback Safety**: Original URLs provided if download fails

The download happens automatically after each generation, ensuring you always have local copies of your generated images!

## Example Usage

### Basic Image Generation
```
Generate a photorealistic image of a golden retriever playing in a field of sunflowers
```

### With Specific Parameters
```
Generate an image with:
- Prompt: "A minimalist logo design for a tech startup, clean lines"
- Aspect ratio: 16:9
- Negative prompt: "cluttered, busy, complex"
- Number of images: 2
```

### Advanced Usage
```
Generate 4 images of "A futuristic cityscape at night with neon lights and flying cars" 
with aspect ratio 21:9 and seed 12345 for reproducible results
```

## Technical Details

### Architecture
- **Language**: TypeScript with ES2022 target
- **Runtime**: Node.js 18+ with ES modules
- **Protocol**: Model Context Protocol (MCP) SDK v1.0.0
- **API Client**: FAL AI JavaScript client v1.0.0
- **Validation**: Zod schema validation

### API Endpoints Used
- **Real-time**: `fal-ai/imagen4/preview/ultra` (subscribe method)
- **Async**: `fal-ai/imagen4/preview/ultra` (queue method)

### Error Handling
- **Graceful API key handling**: Server continues running even without FAL_KEY set
- **No crash failures**: Removed `process.exit()` calls that caused connection drops
- **Null safety checks**: All tools validate API client availability before execution
- **Graceful shutdown**: Proper SIGINT and SIGTERM signal handling
- **API error catching**: Comprehensive error reporting with detailed context
- **Timeout handling**: Robust async request management with progress updates
- **User-friendly messages**: Clear error descriptions instead of technical crashes

## Development

### Project Structure
```
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript (ready to use)
├── test-server.js        # Server testing utility
├── get-path.js          # Configuration path helper
├── example-mcp-config.json # Example configuration
├── package.json         # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration
```

### Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development
- `npm run start` - Start the server directly
- `npm run test` - Test server startup and basic functionality
- `npm run get-path` - Get configuration path for your system

### Making Changes
1. Edit files in the `src/` directory
2. Run `npm run build` to compile
3. Restart your MCP client to use the updated server

### Testing
```bash
npm run test
```

This runs a basic connectivity test that verifies:
- Server starts correctly
- MCP protocol initialization
- Tool discovery functionality

## API Costs

This server uses the FAL AI platform, which charges per image generation. Check [FAL AI pricing](https://fal.ai/pricing) for current rates.

**Typical costs** (as of 2024):
- Imagen 4 Ultra: ~$0.05-0.10 per image
- Costs vary by resolution and complexity

## Troubleshooting

### Server not appearing in MCP client
1. **Recommended**: Use the npx configuration for universal compatibility
2. If using local installation, verify the path to `build/index.js` is correct and absolute
3. Ensure Node.js 18+ is installed: `node --version`
4. Test server startup: `npm run test`
5. Restart your MCP client (Claude Desktop, Kilo Code, etc.)
6. **Note**: Server will start successfully even without FAL_KEY - check tool responses for API key errors

### Image generation failing
1. **Current Known Issue**: The Imagen 4 Ultra endpoint is returning "Unprocessable Entity" errors. This appears to be an API-side issue, not a problem with the MCP server code.
2. Verify your FAL API key is valid and has sufficient credits
3. Check that your prompt follows FAL AI's content policy
4. Try reducing the number of images or simplifying the prompt
5. Use the async tool for complex requests
6. Check the server logs for detailed error messages

### Current API Status Issues
- **Imagen 4 Ultra Preview**: Currently experiencing "Unprocessable Entity" errors
- **Possible Causes**:
  - Model may be in restricted preview access
  - API endpoint changes or temporary unavailability
  - Account access limitations for preview models
- **Workaround**: Monitor [FAL AI's documentation](https://fal.ai/models/fal-ai/imagen4/preview) for updates
- **Alternative**: Consider using other FAL models like FLUX or Stable Diffusion 3.5 until Imagen 4 Ultra is fully available

### Build issues
If you need to rebuild the server:
```bash
npm install
npm run build
```

### Configuration issues
Use the helper script to get the correct path:
```bash
npm run get-path
```

## Support

For issues with:
- **This MCP server**: Create an issue in this repository
- **FAL AI API**: Check [FAL AI documentation](https://fal.ai/docs)
- **MCP Protocol**: See [MCP documentation](https://modelcontextprotocol.io/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run test`
5. Submit a pull request

## Changelog

### v1.0.2 (Latest)
- **📥 Added automatic image download**: Generated images are now automatically saved to local `images` directory
- **🗂️ Smart filename generation**: Images saved with descriptive names including prompt, seed, and timestamp
- **🔄 Enhanced responses**: Returns both local file paths and original URLs for maximum flexibility
- **📁 Auto-directory creation**: Creates `images` folder automatically if it doesn't exist
- **🛡️ Download error handling**: Graceful fallback to original URLs if local download fails

### v1.0.1
- **🔧 Fixed connection drops**: Removed `process.exit()` calls that caused server crashes when `FAL_KEY` was missing
- **🌍 Added portability**: Updated package.json for npx usage - now works universally without local installation
- **✅ Enhanced error handling**: Added graceful shutdown handlers and null safety checks
- **📝 Improved documentation**: Added npx configuration examples and troubleshooting guides

### v1.0.0
- Initial release
- Support for Imagen 4 Ultra via FAL AI
- Real-time and async generation methods
- Comprehensive error handling and logging
- Pre-built executable for immediate use