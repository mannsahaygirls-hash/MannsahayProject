import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Loader2, Send, AlertCircle } from "lucide-react";

const ChatWithAnyone = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    setError("");
    setChatMessages([]);
    
    // Create WebSocket connection to your FastAPI backend
    const ws = new WebSocket("wss://anonymouschat-237214324527.asia-south2.run.app/ws");
    wsRef.current = ws;

    // Connection opened
    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnecting(false);
      setIsConnected(true);
    };

    // Listen for messages from the server
    ws.onmessage = (event) => {
      const messageText = event.data;
      console.log("Received:", messageText);
      
      // Handle system messages
      if (messageText.includes("Waiting for a partner") || 
          messageText.includes("Waiting for a new one")) {
        setConnectionStatus(messageText);
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: messageText 
        }]);
      } 
      else if (messageText.includes("Connected!") || messageText.includes("Say hi")) {
        setConnectionStatus("Connected to a stranger");
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: "You've been connected with someone! 💚" 
        }]);
      }
      else if (messageText.includes("Partner disconnected") || 
               messageText.includes("partner disconnected") ||
               messageText.includes("partner was disconnected")) {
        setConnectionStatus("Partner disconnected");
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: messageText 
        }]);
      }
      else if (messageText.includes("warning") || messageText.includes("Warning")) {
        // Warning message from content filter
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: messageText 
        }]);
      }
      else if (messageText.includes("blocked by content filter")) {
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: messageText 
        }]);
      }
      else if (messageText.includes("No partner connected")) {
        setConnectionStatus(messageText);
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: messageText 
        }]);
      }
      else {
        // Regular message from stranger
        setChatMessages(prev => [...prev, { 
          sender: "stranger", 
          text: messageText 
        }]);
      }
    };

    // Connection closed
    ws.onclose = (event) => {
      console.log("WebSocket disconnected", event.code, event.reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (event.code === 1008) {
        // Policy violation (3 strikes)
        setError("You were disconnected due to policy violations.");
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: "Disconnected due to policy violations." 
        }]);
      } else if (event.code !== 1000) {
        // Abnormal closure
        setConnectionStatus("Disconnected");
        setChatMessages(prev => [...prev, { 
          sender: "system", 
          text: "Connection lost. Please try connecting again." 
        }]);
      }
    };

    // Connection error
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnecting(false);
      setError("Failed to connect. Please check your internet connection and try again.");
    };
  };

  const handleSendMessage = () => {
    if (message.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send message to server
      wsRef.current.send(message);
      
      // Add to local chat (as "you")
      setChatMessages(prev => [...prev, { sender: "you", text: message }]);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setChatMessages([]);
    setConnectionStatus("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Chat with Anyone
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect anonymously with someone who's ready to listen without judgment
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Connection Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isConnected && !isConnecting && (
          <Card className="shadow-lg border-indigo-200 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Ready to Connect?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">💬</div>
                <p className="text-gray-600 leading-relaxed">
                  We'll connect you with another person who wants to share and listen. 
                  All conversations are anonymous and judgment-free.
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 space-y-2">
                <p className="font-semibold text-gray-800">Guidelines:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Be respectful and kind</li>
                  <li>Listen actively and empathetically</li>
                  <li>Keep personal information private</li>
                  <li>Messages are moderated - 3 warnings will disconnect you</li>
                  <li>If you feel uncomfortable, you can end the chat anytime</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                size="lg"
                onClick={handleConnect}
              >
                <Users className="w-5 h-5 mr-2" />
                Find Someone to Chat With
              </Button>
            </CardContent>
          </Card>
        )}

        {isConnecting && (
          <Card className="shadow-lg border-indigo-200 max-w-2xl mx-auto">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Connecting you with someone...
                  </h3>
                  <p className="text-gray-600">
                    Finding a good listener for you
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <Card className="shadow-lg border-indigo-200">
            <CardHeader className="border-b border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <CardTitle className="text-lg">
                    {connectionStatus || "Connected"}
                  </CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                >
                  End Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "you"
                          ? "bg-indigo-600 text-white"
                          : msg.sender === "system"
                          ? "bg-gray-100 text-gray-600 text-sm text-center w-full italic"
                          : "bg-white border border-indigo-200 text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-indigo-200 p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-indigo-300 focus:border-indigo-500"
                    disabled={!isConnected || wsRef.current?.readyState !== WebSocket.OPEN}
                  />
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || !isConnected || wsRef.current?.readyState !== WebSocket.OPEN}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        {!isConnected && !isConnecting && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="border-indigo-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold text-gray-800 mb-2">Anonymous</h3>
                <p className="text-sm text-gray-600">
                  No names, no profiles. Just genuine conversation.
                </p>
              </CardContent>
            </Card>
            <Card className="border-indigo-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">💚</div>
                <h3 className="font-semibold text-gray-800 mb-2">Safe Space</h3>
                <p className="text-sm text-gray-600">
                  Share your thoughts in a judgment-free environment.
                </p>
              </CardContent>
            </Card>
            <Card className="border-indigo-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Mutual Support</h3>
                <p className="text-sm text-gray-600">
                  Help each other by listening and sharing.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithAnyone;