'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { subject_id } = useParams();
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello, how can I help you?', sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof subject_id === 'string') {
      setSubjectId(subject_id);
    }
  }, [subject_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || !subjectId || isLoading) {
      return;
    }

    setIsLoading(true);
    const newUserMessage = { id: Date.now(), text: inputMessage, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    const currentInputMessage = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentInputMessage,
          subject_id: subjectId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = { id: Date.now(), text: data.answer, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now(), 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 lg:left-64 bg-stone-950 z-30"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-stone-900 border-b border-stone-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/landing/library" 
              className="hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20 rounded-full p-1"
            >
              <ArrowLeft className="h-5 w-5 text-stone-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
              <p className="text-sm text-stone-400">Ask questions about your subject materials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="absolute inset-0 top-[73px] bottom-[72px] overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[75%] rounded-2xl px-4 py-3
                    ${message.sender === 'bot'
                      ? 'bg-stone-800 text-left rounded-bl-sm'
                      : 'bg-stone-700 text-left rounded-br-sm'
                    }
                  `}
                >
                  <ReactMarkdown
                    className="text-white text-sm sm:text-base prose prose-invert prose-sm max-w-none"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="bg-stone-800 border-stone-700 text-white rounded-full
                focus:ring-2 focus:ring-white/20 hover:bg-stone-800/80 placeholder:text-stone-400"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              variant="ghost"
              size="icon"
              className={`rounded-full w-10 h-10 shrink-0
                ${isLoading
                  ? 'bg-stone-800 cursor-not-allowed'
                  : 'bg-stone-800 hover:bg-stone-700'
                }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
