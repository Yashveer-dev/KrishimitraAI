import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from 'react-query';
import { MessageCircle, Send, Bot, User, Globe, Volume2 } from 'lucide-react';
import { createChatSession, sendChatMessage, getChatHistory } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userId] = useState('user_' + Date.now());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Create chat session mutation
  const createSessionMutation = useMutation(createChatSession, {
    onSuccess: (data) => {
      setSessionId(data.session_id);
    },
    onError: (error) => {
      console.error('Failed to create chat session:', error);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation(sendChatMessage, {
    onSuccess: (data) => {
      // Validate response data structure
      if (!data || !data.response) {
        throw new Error("Invalid response format");
      }
      
      const response = data.response;
      
      // Validate required fields
      if (!response.text || typeof response.text !== 'string') {
        throw new Error("Invalid response text");
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.text.trim() || "I'm here to help with your farming questions.",
        sender: 'bot',
        language: response.language === 'en' ? 'English' : response.language === 'or' ? 'Odia' : 'English',
        category: response.category || 'general',
        confidence: typeof response.confidence === 'number' ? response.confidence : 0.5,
        followUpQuestions: Array.isArray(response.follow_up_questions) ? response.follow_up_questions : [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chatbot error:', error);
      
      // Provide context-aware error messages
      let errorText = "Sorry, I'm having trouble responding right now. Please try again.";
      
      if (error.message?.includes('Invalid session')) {
        errorText = "Session expired. Please refresh the page and try again.";
      } else if (error.message?.includes('Invalid response')) {
        errorText = "I couldn't process that request properly. Could you rephrase your question?";
      } else if (error.response?.status === 422) {
        errorText = "There was an issue with your message format. Please try again.";
      } else if (error.response?.status >= 500) {
        errorText = "Server is experiencing issues. Please try again in a moment.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        language: 'English',
        category: 'error',
        confidence: 0,
        followUpQuestions: [
          "Would you like to try asking in a different way?",
          "Do you need help with weather information?",
          "Are you looking for crop advice?"
        ],
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  });

  // Initialize session
  useEffect(() => {
    createSessionMutation.mutate(userId);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const detectLanguage = (text) => {
    return /[\u0B00-\u0B7F]/.test(text) ? 'Odia' : 'English';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || sendMessageMutation.isLoading) return;

    const messageToSend = inputMessage;
    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      language: detectLanguage(messageToSend),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Send to bot
    const actualSessionId = sessionId || createSessionMutation.data?.session_id;
    if (actualSessionId) {
      const payload = {
        session_id: actualSessionId,
        message: messageToSend
      };
      sendMessageMutation.mutate(payload);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bilingual Chatbot</h1>
        <p className="text-gray-600 mt-2">Get farming assistance in English and Odia (ଓଡ଼ିଆ)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="card h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">KrishimitraAI Assistant</h2>
                  <p className="text-sm text-gray-500">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Globe className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to KrishimitraAI!</h3>
                  <p className="text-gray-600 mb-4">
                    I can help you with weather updates, disease detection, market prices, and farming advice.
                  </p>
                  <p className="text-sm text-gray-500">
                    Type your message in English or Odia (ଓଡ଼ିଆ) - I understand both!
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-primary-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`space-y-1 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`inline-block px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className={message.language === 'Odia' ? 'odia-font' : ''}>
                          {message.text}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{message.language}</span>
                        <span>•</span>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.confidence && (
                          <>
                            <span>•</span>
                            <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-4 border-t">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message in English or Odia..."
                  className="flex-1 input-field"
                  disabled={sendMessageMutation.isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sendMessageMutation.isLoading}
                  className="btn-primary p-3"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
            <div className="space-y-2">
              {[
                "What's the weather today?",
                "My rice plants have yellow leaves",
                "What's the current market price?",
                "How to prevent crop diseases?"
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Language Support */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Language Support</span>
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <span className="font-medium">English:</span>
                <span>Full support</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">ଓଡ଼ିଆ (Odia):</span>
                <span>Full support</span>
              </div>
              <p className="text-xs mt-3">
                Type in either language - I'll understand and respond appropriately!
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What I Can Help With</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Real-time weather information</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Crop disease identification</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Market price updates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Farming best practices</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Government scheme information</span>
              </li>
            </ul>
          </div>

          {/* Voice Input (Future Feature) */}
          <div className="card bg-gray-50 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-gray-400" />
              <span>Voice Input</span>
            </h3>
            <p className="text-sm text-gray-600">
              Voice input feature coming soon! You'll be able to speak in English or Odia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
