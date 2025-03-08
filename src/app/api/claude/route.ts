import { AnthropicStream, StreamingTextResponse } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

// Create an Anthropic API client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { messages, temperature = 0.7, model = 'claude-3-opus-20240229', systemPrompt = '' } = await req.json();

        // Validate the request
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({
                    error: 'Messages are required and must be a non-empty array',
                }),
                { status: 400 }
            );
        }

        // Convert messages to Anthropic format
        const anthropicMessages = messages.map((message: any) => ({
            role: message.role === 'user' ? 'user' : 'assistant',
            content: message.content,
        }));

        // Add system prompt if provided
        const systemMessage = systemPrompt ? { role: 'system', content: systemPrompt } : null;
        const finalMessages = systemMessage
            ? [systemMessage, ...anthropicMessages]
            : anthropicMessages;

        // Create a chat completion
        const response = await anthropic.messages.create({
            model,
            messages: finalMessages,
            temperature: parseFloat(temperature.toString()),
            stream: true,
            max_tokens: 4096,
        });

        // Convert the response into a friendly text-stream
        const stream = AnthropicStream(response);

        // Return a StreamingTextResponse, which is a ReadableStream
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('Error in Claude API:', error);
        return new Response(
            JSON.stringify({
                error: 'There was an error processing your request',
            }),
            { status: 500 }
        );
    }
} 