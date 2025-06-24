#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fal } from "@fal-ai/client";
// Check for required environment variable
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
    console.error('FAL_KEY environment variable is required');
    process.exit(1);
}
// Configure FAL client
fal.config({
    credentials: FAL_KEY
});
// Create MCP server
const server = new McpServer({
    name: "fal-imagen4-server",
    version: "1.0.0",
});
// Tool: Generate images with Imagen 4 Ultra
server.tool("imagen4_generate", {
    description: "Generate high-quality images using Google's Imagen 4 Ultra model via FAL AI",
    inputSchema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "The text prompt describing what you want to see"
            },
            negative_prompt: {
                type: "string",
                description: "A description of what to discourage in the generated images",
                default: ""
            },
            aspect_ratio: {
                type: "string",
                enum: ["1:1", "16:9", "9:16", "3:4", "4:3"],
                description: "The aspect ratio of the generated image",
                default: "1:1"
            },
            num_images: {
                type: "integer",
                minimum: 1,
                maximum: 4,
                description: "Number of images to generate (1-4)",
                default: 1
            },
            seed: {
                type: "integer",
                description: "Random seed for reproducible generation"
            }
        },
        required: ["prompt"]
    }
}, async (args) => {
    const { prompt, negative_prompt = "", aspect_ratio = "1:1", num_images = 1, seed } = args;
    try {
        // Prepare input for FAL API
        const input = {
            prompt,
            negative_prompt,
            aspect_ratio,
            num_images
        };
        // Add seed if provided
        if (seed !== undefined) {
            input.seed = seed;
        }
        console.error(`Generating ${num_images} image(s) with prompt: "${prompt}"`);
        // Call FAL Imagen 4 Ultra API
        const result = await fal.subscribe("fal-ai/imagen4/preview/ultra", {
            input,
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log) => log.message).forEach((msg) => console.error(`FAL Log: ${msg}`));
                }
            },
        });
        // Format response
        const images = result.data.images.map((img, index) => ({
            url: img.url,
            index: index + 1,
            content_type: img.content_type || "image/png",
            file_size: img.file_size
        }));
        const responseText = `Successfully generated ${images.length} image(s) using Imagen 4 Ultra:

${images.map(img => `Image ${img.index}: ${img.url}`).join('\n')}

Generation Details:
- Prompt: "${prompt}"
- Negative Prompt: "${negative_prompt || 'None'}"
- Aspect Ratio: ${aspect_ratio}
- Seed: ${result.data.seed}
- Request ID: ${result.requestId}

The images are ready to view and download from the provided URLs.`;
        return {
            content: [
                {
                    type: "text",
                    text: responseText
                }
            ]
        };
    }
    catch (error) {
        console.error('Error generating image:', error);
        let errorMessage = "Failed to generate image with Imagen 4 Ultra.";
        if (error instanceof Error) {
            errorMessage += ` Error: ${error.message}`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: errorMessage
                }
            ],
            isError: true
        };
    }
});
// Tool: Generate images using queue method (for longer requests)
server.tool("imagen4_generate_async", {
    description: "Generate images using Imagen 4 Ultra with async queue method for longer requests",
    inputSchema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "The text prompt describing what you want to see"
            },
            negative_prompt: {
                type: "string",
                description: "A description of what to discourage in the generated images",
                default: ""
            },
            aspect_ratio: {
                type: "string",
                enum: ["1:1", "16:9", "9:16", "3:4", "4:3"],
                description: "The aspect ratio of the generated image",
                default: "1:1"
            },
            num_images: {
                type: "integer",
                minimum: 1,
                maximum: 4,
                description: "Number of images to generate (1-4)",
                default: 1
            },
            seed: {
                type: "integer",
                description: "Random seed for reproducible generation"
            }
        },
        required: ["prompt"]
    }
}, async (args) => {
    const { prompt, negative_prompt = "", aspect_ratio = "1:1", num_images = 1, seed } = args;
    try {
        // Prepare input for FAL API
        const input = {
            prompt,
            negative_prompt,
            aspect_ratio,
            num_images
        };
        // Add seed if provided
        if (seed !== undefined) {
            input.seed = seed;
        }
        console.error(`Submitting async request for ${num_images} image(s) with prompt: "${prompt}"`);
        // Submit request to queue
        const { request_id } = await fal.queue.submit("fal-ai/imagen4/preview/ultra", {
            input
        });
        console.error(`Request submitted with ID: ${request_id}`);
        // Poll for completion
        let result;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes with 5-second intervals
        while (attempts < maxAttempts) {
            const status = await fal.queue.status("fal-ai/imagen4/preview/ultra", {
                requestId: request_id,
                logs: true
            });
            console.error(`Status check ${attempts + 1}: ${status.status}`);
            if (status.status === "COMPLETED") {
                result = await fal.queue.result("fal-ai/imagen4/preview/ultra", {
                    requestId: request_id
                });
                break;
            }
            // Check if we should continue polling
            if (status.status !== "IN_QUEUE" && status.status !== "IN_PROGRESS") {
                throw new Error(`Image generation failed with status: ${status.status}`);
            }
            // Wait 5 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
        }
        if (!result) {
            throw new Error("Request timed out after 5 minutes");
        }
        // Format response
        const images = result.data.images.map((img, index) => ({
            url: img.url,
            index: index + 1,
            content_type: img.content_type || "image/png",
            file_size: img.file_size
        }));
        const responseText = `Successfully generated ${images.length} image(s) using Imagen 4 Ultra (Async):

${images.map((img) => `Image ${img.index}: ${img.url}`).join('\n')}

Generation Details:
- Prompt: "${prompt}"
- Negative Prompt: "${negative_prompt || 'None'}"
- Aspect Ratio: ${aspect_ratio}
- Seed: ${result.data.seed}
- Request ID: ${request_id}

The images are ready to view and download from the provided URLs.`;
        return {
            content: [
                {
                    type: "text",
                    text: responseText
                }
            ]
        };
    }
    catch (error) {
        console.error('Error in async image generation:', error);
        let errorMessage = "Failed to generate image with Imagen 4 Ultra (async).";
        if (error instanceof Error) {
            errorMessage += ` Error: ${error.message}`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: errorMessage
                }
            ],
            isError: true
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('FAL Imagen 4 MCP server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map