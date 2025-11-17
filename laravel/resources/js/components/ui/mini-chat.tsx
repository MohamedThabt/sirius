import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface MiniChatProps {
  className?: string;
}

export const MiniChat = ({ className = "" }: MiniChatProps) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Hi! Tell me about your project and I\'ll generate a quick PRD sample.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const sampleResponses = [
    "📋 **Project Requirements Document**\n\n**Objective:** Build a task management app\n**Timeline:** 8 weeks\n**Tech Stack:** React, Node.js, PostgreSQL\n\n**Key Features:**\n• User authentication\n• Task creation and management\n• Team collaboration\n• Progress tracking",
    "🔄 **SDLC Workflow Generated**\n\n**Phase 1:** Requirements (Week 1)\n**Phase 2:** Design & Architecture (Week 2)\n**Phase 3:** Development Sprint 1-4 (Weeks 3-6)\n**Phase 4:** Testing & QA (Week 7)\n**Phase 5:** Deployment (Week 8)\n\n*Estimated time saved: 15+ hours*",
    "⚡ **Quick Analysis Complete**\n\n**Project Type:** Web Application\n**Complexity:** Medium\n**Resources Needed:** 3 developers, 1 designer\n**Risk Assessment:** Low-Medium\n\n**Next Steps:**\n1. Set up development environment\n2. Create database schema\n3. Build authentication system"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={`w-full max-w-md bg-card/95 backdrop-blur-sm border border-border/50 ${className}`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">AI Assistant Demo</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online • Try it now!
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {message.content.includes('**') ? (
                  <pre className="whitespace-pre-wrap font-sans text-xs">
                    {message.content}
                  </pre>
                ) : (
                  message.content
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3 h-3 text-accent" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-3 h-3 text-primary animate-spin" />
              </div>
              <div className="bg-secondary text-secondary-foreground p-2 rounded-lg text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your project..."
            className="flex-1 text-sm"
            disabled={isTyping}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};