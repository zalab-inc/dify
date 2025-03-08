import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Create an OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { messages, temperature = 0.7, model = 'gpt-3.5-turbo', systemPrompt = '' } = await req.json();

        // Validate the request
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({
                    error: 'Messages are required and must be a non-empty array',
                }),
                { status: 400 }
            );
        }

        // Prepare messages array with optional system prompt
        const apiMessages = systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages;

        // Create a chat completion
        const response = await openai.chat.completions.create({
            model,
            messages: apiMessages,
            temperature: parseFloat(temperature.toString()),
            stream: true,
        });

        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response);

        // Return a StreamingTextResponse, which is a ReadableStream
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('Error in chat API:', error);
        return new Response(
            JSON.stringify({
                error: 'There was an error processing your request',
            }),
            { status: 500 }
        );
    }
} 