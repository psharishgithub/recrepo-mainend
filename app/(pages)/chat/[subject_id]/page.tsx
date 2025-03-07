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
import { useSession } from 'next-auth/react';
import { BookmarkPlus, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const { subject_id } = useParams();
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello, how can I help you?', sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [savedResponses, setSavedResponses] = useState<number[]>([]);

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
    
    // Add a temporary bot message that will be updated with streaming content
    const botMessageId = Date.now() + 1;
    setMessages(prevMessages => [...prevMessages, { 
      id: botMessageId, 
      text: '', 
      sender: 'bot' 
    }]);

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

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.error) {
              throw new Error(data.error);
            }

            if (data.content) {
              accumulatedText += data.content;
              // Update the last bot message with accumulated text
              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResponse = async (messageId: number, content: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/responses/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          userId: session.user.id,
          subjectId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save response');

      setSavedResponses(prev => [...prev, messageId]);
      toast.success('Response saved successfully');
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
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
              href="/library" 
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
                    relative max-w-[75%] rounded-2xl px-4 py-3
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
                  {message.sender === 'bot' && message.text && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 hover:bg-stone-700/50"
                      onClick={() => handleSaveResponse(message.id, message.text)}
                      disabled={savedResponses.includes(message.id)}
                    >
                      {savedResponses.includes(message.id) ? (
                        <Bookmark className="h-4 w-4 text-primary" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4 text-stone-400" />
                      )}
                    </Button>
                  )}
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
