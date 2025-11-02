import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const db = getFirestore();

const MannMitra = () => {
  // ---------------- AUTH ----------------
  const [user, setUser] = useState<any>(null);
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

  // ---------------- CHAT STATES ----------------
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey! What's on your mind today? I'm here to listen 😊", audio: null },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOutputMode, setVoiceOutputMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasUserMessages, setHasUserMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // ---------------- SESSION HANDLING ----------------
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let existingSessionId = sessionStorage.getItem("sessionId");
    if (!existingSessionId) {
      existingSessionId = Date.now().toString();
      sessionStorage.setItem("sessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("chatMessages");
    if (saved) {
      const loadedMessages = JSON.parse(saved);
      setMessages(loadedMessages);
      const hasUser = loadedMessages.some((msg: any) => msg.sender === "user");
      setHasUserMessages(hasUser);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- FIRESTORE SESSION SETUP ----------------
  const initializeSession = async () => {
    if (!userId || !sessionId || hasUserMessages) return;
    
    const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
    const docSnap = await getDoc(sessionRef);
    if (!docSnap.exists()) {
      await setDoc(sessionRef, {
        startedAt: serverTimestamp(),
        messages: [],
      });
    }
    setHasUserMessages(true);
  };

  // ---------------- SPEECH RECOGNITION SETUP ----------------
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log("Speech recognition started");
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Recognized:", transcript);
          setInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please enable microphone permissions.');
          }
        };

        recognition.onend = () => {
          console.log("Speech recognition ended");
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn("Speech recognition not supported in this browser");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ---------------- PLAY AUDIO ----------------
  const playAudio = async (audioBase64: string) => {
    try {
      console.log("Playing audio, base64 length:", audioBase64.length);
      
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const header = bytes.slice(0, 16);
      const headerHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log("Audio header:", headerHex);
      
      const formats = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
      
      for (const format of formats) {
        try {
          const audioBlob = new Blob([bytes], { type: format });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            
            await new Promise((resolve, reject) => {
              if (!audioRef.current) return reject("No audio ref");
              
              const timeout = setTimeout(() => reject("Timeout"), 3000);
              
              audioRef.current.onloadedmetadata = () => {
                clearTimeout(timeout);
                console.log(`✓ Audio loaded with ${format}`);
                resolve(true);
              };
              
              audioRef.current.onerror = () => {
                clearTimeout(timeout);
                reject(`Failed with ${format}`);
              };
            });
            
            await audioRef.current.play();
            console.log(`Playing with ${format}`);
            
            audioRef.current.onended = () => {
              URL.revokeObjectURL(audioUrl);
            };
            
            return;
          }
        } catch (err) {
          console.log(`Format ${format} failed, trying next...`);
        }
      }
      
      throw new Error("Could not play with any format");
      
    } catch (err) {
      console.error("Audio playback error:", err);
      alert(`Audio playback failed. Error: ${err}`);
    }
  };

  // ---------------- VOICE RECORDING ----------------
  const startRecording = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording:", err);
        alert("Could not start recording. Please check microphone permissions.");
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // ---------------- MESSAGE SENDER (TEXT MODE) ----------------
  const handleSendText = async (messageText: string) => {
    await initializeSession();

    const newUserMessage = { sender: "user", text: messageText, audio: null };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    if (userId && sessionId) {
      const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
      await updateDoc(sessionRef, {
        messages: arrayUnion({
          sender: "user",
          text: messageText,
          timestamp: new Date(),
        }),
      });
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
            zone_name: "home",
            prompt: messageText,
          }),
        }
      );

      const data = await res.json();
      const aiMessages = data.messages?.filter((msg: any) => msg.type === "ai");
      const lastBotMessage =
        aiMessages?.[aiMessages.length - 1]?.content ||
        data.reply ||
        "Sorry, I didn't quite get that. Could you rephrase?";

      const newBotMessage = { sender: "bot", text: lastBotMessage, audio: null };
      const updatedMessages = [...newMessages, newBotMessage];
      setMessages(updatedMessages);

      if (userId && sessionId) {
        const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
        await updateDoc(sessionRef, {
          messages: arrayUnion({
            sender: "bot",
            text: lastBotMessage,
            timestamp: new Date(),
          }),
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again 😞", audio: null },
      ]);
    }
  };

  // ---------------- MESSAGE SENDER (VOICE MODE) ----------------
  const handleSendVoice = async (messageText: string) => {
    await initializeSession();

    const newUserMessage = { sender: "user", text: messageText, audio: null };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    if (userId && sessionId) {
      const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
      await updateDoc(sessionRef, {
        messages: arrayUnion({
          sender: "user",
          text: messageText,
          timestamp: new Date(),
        }),
      });
    }

    try {
      const res = await fetch(
        "https://voice-155669311814.asia-south1.run.app/api/chat-voice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: messageText,
            userId: userId,
          }),
        }
      );

      const data = await res.json();
      const botText = data.responseText || "Sorry, I didn't quite get that.";
      const audioBase64 = data.audioBase64;

      const newBotMessage = { 
        sender: "bot", 
        text: botText, 
        audio: audioBase64 
      };
      const updatedMessages = [...newMessages, newBotMessage];
      setMessages(updatedMessages);

      if (audioBase64) {
        await playAudio(audioBase64);
      }

      if (userId && sessionId) {
        const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
        await updateDoc(sessionRef, {
          messages: arrayUnion({
            sender: "bot",
            text: botText,
            timestamp: new Date(),
            hasAudio: true,
          }),
        });
      }
    } catch (err) {
      console.error("Error sending voice message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again 😞", audio: null },
      ]);
    }
  };

  // ---------------- UNIFIED SEND HANDLER ----------------
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageText = input;
    setInput("");
    setLoading(true);

    try {
      if (voiceOutputMode) {
        await handleSendVoice(messageText);
      } else {
        await handleSendText(messageText);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TOGGLE VOICE OUTPUT MODE ----------------
  const toggleVoiceOutput = () => {
    setVoiceOutputMode(!voiceOutputMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(120,40%,98%)] via-[hsl(160,30%,96%)] to-[hsl(200,30%,95%)] p-4 md:p-8 flex justify-center items-center">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="w-full max-w-3xl">
        <Card className="shadow-[0_8px_30px_hsl(140,40%,55%,0.15)] border-[hsl(120,30%,85%)] backdrop-blur-sm bg-white/95 transition-all duration-300 hover:shadow-[0_12px_40px_hsl(140,40%,55%,0.2)]">
          <CardHeader className="bg-gradient-to-r from-[hsl(140,40%,55%)] to-[hsl(160,30%,65%)] text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-semibold">
              <span className="text-3xl">💬</span>
              <span>MannSahay</span>
              <span className="text-3xl"></span>
            </CardTitle>
            <p className="text-center text-sm text-white/90 mt-1">Your wellness companion</p>
            <div className="flex gap-2 justify-center mt-3 text-xs flex-wrap">
              {voiceOutputMode && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  Voice Output ON
                </span>
              )}
              {isRecording && (
                <span className="bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1.5 border border-white/30">
                  <Mic className="w-3 h-3" />
                  Listening...
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-12">
            <div className="bg-gradient-to-br from-[hsl(120,50%,97%)] to-[hsl(200,30%,95%)] rounded-xl p-4 md:p-6 mb-6 max-h-[500px] overflow-y-auto shadow-inner border border-[hsl(120,30%,85%)]">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(140,40%,55%)] to-[hsl(160,30%,65%)] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                        💬
                      </div>
                    )}
                    <div className="flex flex-col gap-1 max-w-xs">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-[hsl(140,40%,55%)] to-[hsl(160,30%,65%)] text-white shadow-md"
                            : "bg-white text-[hsl(120,20%,25%)] shadow-sm border border-[hsl(120,30%,85%)]"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.audio && msg.sender === "bot" && (
                        <button
                          onClick={() => playAudio(msg.audio)}
                          className="text-xs text-[hsl(140,40%,55%)] hover:text-[hsl(140,40%,45%)] flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full hover:bg-[hsl(140,40%,95%)] transition-all duration-200 border border-[hsl(140,40%,85%)]"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Replay Audio
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(140,40%,55%)] to-[hsl(160,30%,65%)] flex items-center justify-center text-white text-lg shadow-md">
                      🌿
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white text-[hsl(120,20%,45%)] text-sm italic shadow-sm border border-[hsl(120,30%,85%)] animate-pulse">
                      {voiceOutputMode ? "Generating voice response..." : "Typing..."}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2 md:gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? "Listening..." : "Share your thoughts..."}
                  className="flex-1 p-3 md:p-4 border-2 border-[hsl(120,30%,85%)] rounded-xl focus:border-[hsl(140,40%,55%)] focus:outline-none focus:ring-4 focus:ring-[hsl(140,40%,55%,0.1)] transition-all duration-300 bg-white text-[hsl(120,20%,25%)] placeholder:text-[hsl(120,10%,60%)]"
                  disabled={loading || isRecording}
                />
                
                <Button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={loading}
                  className={`${isRecording ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-r from-[hsl(200,60%,60%)] to-[hsl(200,60%,70%)] hover:from-[hsl(200,60%,55%)] hover:to-[hsl(200,60%,65%)]'} text-white shadow-md transition-all duration-300 hover:shadow-lg px-4 md:px-5 rounded-xl`}
                  title="Hold to speak"
                >
                  {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-[hsl(140,40%,55%)] to-[hsl(160,30%,65%)] hover:from-[hsl(140,40%,50%)] hover:to-[hsl(160,30%,60%)] text-white shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed px-5 md:px-6 rounded-xl"
                >
                  {loading ? "..." : "Send"}
                </Button>

                <Button
                  onClick={toggleVoiceOutput}
                  className={`${voiceOutputMode ? 'bg-gradient-to-r from-[hsl(140,40%,55%)] to-[hsl(160,30%,65%)]' : 'bg-gradient-to-r from-[hsl(0,0%,70%)] to-[hsl(0,0%,80%)]'} hover:opacity-90 text-white shadow-md transition-all duration-300 hover:shadow-lg px-4 md:px-5 rounded-xl`}
                  title={voiceOutputMode ? "Voice output ON" : "Voice output OFF"}
                >
                  {voiceOutputMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </div>
              
              <div className="text-xs text-[hsl(120,10%,50%)] text-center bg-[hsl(120,50%,97%)] rounded-lg py-2 px-4 border border-[hsl(120,30%,90%)]">
                {voiceOutputMode 
                  ? "🔊 Voice output enabled - responses include audio" 
                  : "💬 Text mode - enable voice output for audio responses"
                }
                {" • "}
                <span className="text-[hsl(200,60%,50%)] font-medium">Hold mic button to speak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MannMitra;