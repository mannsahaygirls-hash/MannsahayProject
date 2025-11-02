import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const IncognitoPage = () => {
  // Firebase Auth
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("guest");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
      } else {
        setUser(null);
        setUserId("guest");
      }
    });
    return () => unsubscribe();
  }, []);

  // Chat messages
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey! What's on your mind today? I'm here to listen 😊" },
  ]);

  // Input + loading state
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-scroll reference
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to backend
  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get Firebase ID Token if user is logged in
      let idToken = null;
      if (user) {
        idToken = await user.getIdToken();
      }

      const res = await fetch(
        "https://mann-backend-237214324527.asia-south2.run.app/chat/invoke",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken && { Authorization: `Bearer ${idToken}` }),
          },
          body: JSON.stringify({
            user_uuid: userId,
            zone_name: "home",
            prompt: input,
          }),
        }
      );

      const data = await res.json();
      console.log("Backend response:", data);

      const aiMessages = data.messages?.filter((msg) => msg.type === "ai");
      const lastBotMessage =
        aiMessages?.[aiMessages.length - 1]?.content ||
        data.reply ||
        "Sorry, I didn’t quite get that. Could you rephrase?";

      setMessages((prev) => [...prev, { sender: "bot", text: lastBotMessage }]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again 😞" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Incognito Mode 👁️
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your friendly companion — talk like friends, no judgment, just real
            conversations
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with your digital buddy who talks like a real friend. Share
            your thoughts, get support, and discover activities to boost your
            mood together.
          </p>
        </div>

        {/* Chat Section */}
        <Card className="mb-12 shadow-wellness border-wellness-primary/20">
          <CardHeader className="bg-gradient-warm">
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <span className="text-accent-foreground">
                Chat with Your MannMitra "Your Chat's are private"
              </span>
            </CardTitle>
            <p className="text-accent-foreground/80">
              Talk like you would with a close friend — casual, honest, and
              judgment-free
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Message Area */}
            <div className="bg-wellness-calm/20 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-wellness-primary flex items-center justify-center text-white text-sm">
                        👥
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-xs text-sm ${
                        msg.sender === "user"
                          ? "bg-wellness-primary text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-wellness-primary flex items-center justify-center text-white text-sm">
                      👥
                    </div>
                    <div className="rounded-lg p-3 bg-white text-gray-500 text-sm italic">
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-wellness-primary/30 rounded-lg focus:border-wellness-primary focus:outline-none"
                disabled={loading}
              />
              <Button variant="wellness" onClick={handleSend} disabled={loading}>
                {loading ? "..." : "Send"}
              </Button>
             
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              💡 Try starting with: “Hey, I'm feeling stressed about...” or “Can
              we just chat about...”
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncognitoPage;