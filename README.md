# AI Chatbot with Next.js and Vercel AI SDK

A modern, responsive AI chatbot application built with Next.js, Vercel AI SDK, and OpenAI.

## Features

- 💬 Real-time streaming responses from OpenAI
- 🔄 Chat history saved in localStorage
- ⚙️ Customizable AI parameters (temperature, model)
- 📱 Responsive UI with Tailwind CSS
- ⌨️ Typing animation for a more natural feel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chatbot-app.git
cd chatbot-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
chatbot-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts  # API route for chat
│   │   ├── components/
│   │   │   ├── ChatDisplay.tsx  # Component for displaying chat messages
│   │   │   ├── ChatInput.tsx    # Component for user input
│   │   │   ├── ChatSettings.tsx # Component for AI settings
│   │   │   └── Message.tsx      # Component for individual messages
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main page component
│   └── ...
├── .env.local                 # Environment variables
├── package.json
└── ...
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - AI utilities and hooks
- [OpenAI API](https://openai.com/api/) - AI model provider
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Vercel](https://vercel.com/) for the AI SDK
- [OpenAI](https://openai.com/) for the AI models
