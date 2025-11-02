import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import chatbotBg from "@/assets/chatbot-bg.jpg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

const db = getFirestore();

const Chatbot = () => {
  // ---------------- AUTH ----------------
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("guest");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
        console.log("Mann Sahay - User logged in:", firebaseUser.uid);
      } else {
        setUser(null);
        setUserId("guest");
      }
    });
    return () => unsubscribe();
  }, []);

  // ---------------- CHAT STATES ----------------
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey! What's on your mind today? I'm here to listen 😊" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserMessages, setHasUserMessages] = useState(false); // Track if user sent any messages
  const messagesEndRef = useRef(null);

  // ---------------- SESSION HANDLING ----------------
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let existingSessionId = sessionStorage.getItem("mannSahaySessionId");
    if (!existingSessionId) {
      existingSessionId = Date.now().toString();
      sessionStorage.setItem("mannSahaySessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
    console.log("Mann Sahay Session ID:", existingSessionId);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("mannSahayMessages");
    if (saved) {
      const loadedMessages = JSON.parse(saved);
      setMessages(loadedMessages);
      // Check if there are any user messages
      const hasUser = loadedMessages.some((msg) => msg.sender === "user");
      setHasUserMessages(hasUser);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("mannSahayMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- FIRESTORE SESSION SETUP (ONLY WHEN USER SENDS FIRST MESSAGE) ----------------
  const initializeSession = async () => {
    if (!userId || userId === "guest" || !sessionId || hasUserMessages) return;
    
    try {
      const sessionRef = doc(db, "users", userId, "mannSahaySessions", sessionId);
      const docSnap = await getDoc(sessionRef);
      if (!docSnap.exists()) {
        await setDoc(sessionRef, {
          startedAt: serverTimestamp(),
          messages: [],
        });
        console.log("✅ Mann Sahay session created:", sessionId);
      }
      setHasUserMessages(true);
    } catch (error) {
      console.error("❌ Error initializing Mann Sahay session:", error);
    }
  };

  // ---------------- MESSAGE HANDLER ----------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const messageText = input;
    
    // Initialize session on first message
    await initializeSession();

    const newUserMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Save user message to Firestore
    if (userId && userId !== "guest" && sessionId) {
      try {
        const sessionRef = doc(db, "users", userId, "mannSahaySessions", sessionId);
        await updateDoc(sessionRef, {
          messages: arrayUnion({
            sender: "user",
            text: messageText,
            timestamp: new Date(),
          }),
        });
        console.log("✅ User message saved to Mann Sahay");
      } catch (error) {
        console.error("❌ Error saving user message:", error);
      }
    }

    try {
      let idToken = null;
      if (user) idToken = await user.getIdToken();

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
            zone_name: "chill",
            prompt: messageText,
          }),
        }
      );

      const data = await res.json();
      const aiMessages = data.messages?.filter((msg) => msg.type === "ai");
      const lastBotMessage =
        aiMessages?.[aiMessages.length - 1]?.content ||
        data.reply ||
        "Sorry, I didn't quite get that. Could you rephrase?";

      setMessages((prev) => [...prev, { sender: "bot", text: lastBotMessage }]);

      // Save bot message to Firestore
      if (userId && userId !== "guest" && sessionId) {
        try {
          const sessionRef = doc(db, "users", userId, "mannSahaySessions", sessionId);
          await updateDoc(sessionRef, {
            messages: arrayUnion({
              sender: "bot",
              text: lastBotMessage,
              timestamp: new Date(),
            }),
          });
          console.log("✅ Bot message saved to Mann Sahay");
        } catch (error) {
          console.error("❌ Error saving bot message:", error);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again 😞" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isTyping) handleSend();
  };

  const suggestedPrompts = [
    "I'm feeling overwhelmed with work",
    "I've been anxious lately",
    "I need someone to talk to",
    "I'm having trouble sleeping",
    "I want to practice gratitude",
  ];

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🫂 Your Supportive Guide
          </h1>
          <p className="text-lg text-muted-foreground">
            An empathetic space for meaningful conversations
          </p>
        </div>

        <Card className="h-[600px] flex flex-col shadow-wellness border-wellness-primary/20">
          <CardHeader
            className="bg-gradient-wellness text-primary-foreground rounded-t-lg"
            style={{
              backgroundImage: `url(${chatbotBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="bg-wellness-primary/90 rounded-lg p-4">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <span>MannMitra</span>
                <span className="text-sm opacity-80 ml-auto">Online</span>
              </CardTitle>
            </div>
          </CardHeader>

          
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-wellness-primary text-primary-foreground ml-12"
                          : "bg-card border border-wellness-primary/20 mr-12"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="border border-wellness-primary/20 p-3 rounded-lg mr-12">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-wellness-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-wellness-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-wellness-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {messages.length === 1 && (
              <div className="p-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Try asking about:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(prompt)}
                      className="text-xs hover:border-wellness-primary hover:text-wellness-primary"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t bg-card/50">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind... I'm here to listen 💙"
                  className="min-h-[60px] resize-none border-wellness-primary/30 focus:border-wellness-primary"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  variant="wellness"
                  size="lg"
                  className="self-end"
                >
                  Send
                </Button>
              </div>
            </div>
          
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;