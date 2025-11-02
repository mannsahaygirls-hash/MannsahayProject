// History.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History as HistoryIcon, MessageSquare, Activity, BookOpen } from "lucide-react";
import { db, auth } from "@/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

const History = () => {
  const [mannSahaySessions, setMannSahaySessions] = useState([]);
  const [mannMitraSessions, setMannMitraSessions] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // 🌿 Fetch Mann Sahay Sessions
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setMannSahaySessions([]);
      return;
    }

    const sessionsRef = collection(db, "users", user.uid, "mannSahaySessions");
    const q = query(sessionsRef, orderBy("startedAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            messages: data.messages || [],
            ...data,
          };
        })
        .filter((session) => {
          // Only include sessions with at least one message
          return session.messages && session.messages.length > 0;
        });
      
      setMannSahaySessions(sessions);
      console.log("Mann Sahay sessions fetched:", sessions.length);
    });

    return () => unsub();
  }, []);

  // 💬 Fetch Mann Mitra Chat Sessions
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setMannMitraSessions([]);
      return;
    }

    const sessionsRef = collection(db, "users", user.uid, "chatSessions");
    const q = query(sessionsRef, orderBy("startedAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            messages: data.messages || [],
            ...data,
          };
        })
        .filter((session) => {
          // Only include sessions with at least one message
          return session.messages && session.messages.length > 0;
        });
      
      setMannMitraSessions(sessions);
      console.log("Mann Mitra sessions fetched:", sessions.length);
    });

    return () => unsub();
  }, []);

  // 🧠 Fetch Journals
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setJournalEntries([]);
      return;
    }

    const entriesRef = collection(db, "journals", user.uid, "entries");
    const q = query(entriesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled",
          preview: (data.content && data.content.slice(0, 200)) || "",
          content: data.content || "",
          createdISO: data.createdISO || null,
          createdAt: data.createdAt
            ? data.createdAt.toDate()
            : data.createdISO
            ? new Date(data.createdISO)
            : null,
        };
      });
      setJournalEntries(items);
    });

    return () => unsub();
  }, []);

  // 🕹️ UI
  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HistoryIcon className="w-8 h-8 text-wellness-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Journey</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Track your wellness activities and conversations
          </p>
        </div>

        <Tabs defaultValue="mannSahay" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-wellness-primary/20">
            <TabsTrigger
              value="mannSahay"
              className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Mann Sahay
            </TabsTrigger>

            <TabsTrigger
              value="mannMitra"
              className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="w-4 h-4 mr-2" /> Mann Mitra
            </TabsTrigger>

            <TabsTrigger
              value="journals"
              className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Journals
            </TabsTrigger>
          </TabsList>

          {/* Mann Sahay — Real Chat History */}
          <TabsContent value="mannSahay" className="space-y-4">
            {mannSahaySessions.length === 0 && (
              <div className="text-center text-muted-foreground p-6">
                No chat sessions yet. Start chatting with your Mann Sahay!
              </div>
            )}

            {mannSahaySessions.map((session) => (
              <Card
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="hover:shadow-wellness transition-all duration-300 cursor-pointer border-wellness-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        Session – {new Date(session.startedAt?.seconds * 1000).toLocaleString()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {session.messages?.length || 0} messages
                      </p>
                    </div>
                    <MessageSquare className="w-5 h-5 text-wellness-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Mann Mitra — Real Chat History */}
          <TabsContent value="mannMitra" className="space-y-4">
            {mannMitraSessions.length === 0 && (
              <div className="text-center text-muted-foreground p-6">
                No chat sessions yet. Start chatting with your Mann Mitra!
              </div>
            )}

            {mannMitraSessions.map((session) => (
              <Card
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="hover:shadow-wellness transition-all duration-300 cursor-pointer border-wellness-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        Session – {new Date(session.startedAt?.seconds * 1000).toLocaleString()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {session.messages?.length || 0} messages
                      </p>
                    </div>
                    <Activity className="w-5 h-5 text-wellness-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Journals */}
          <TabsContent value="journals" className="space-y-4">
            {journalEntries.length === 0 && (
              <div className="text-center text-muted-foreground p-6">
                No journal entries yet. Write one in Activity Zone → Journal.
              </div>
            )}

            {journalEntries.map((entry) => (
              <Card
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="hover:shadow-wellness transition-all duration-300 cursor-pointer border-wellness-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {entry.preview}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {entry.createdAt ? entry.createdAt.toLocaleString() : ""}
                      </span>
                    </div>
                    <BookOpen className="w-5 h-5 text-wellness-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* 💬 Modal for Chat Session */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-lg max-w-2xl w-full p-6 overflow-auto max-h-[80vh]">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                  Chat Session —{" "}
                  {new Date(selectedSession.startedAt?.seconds * 1000).toLocaleString()}
                </h2>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedSession(null)}
                >
                  Close ✕
                </button>
              </div>
              <div className="space-y-3">
                {selectedSession.messages?.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      m.sender === "user"
                        ? "bg-wellness-primary text-white text-right"
                        : "bg-muted text-foreground text-left"
                    }`}
                  >
                    <p className="text-sm">{m.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {m.timestamp?.seconds 
                        ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString()
                        : new Date(m.timestamp).toLocaleTimeString()
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 📖 Modal for Journal Entry */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-lg max-w-2xl w-full p-6 overflow-auto max-h-[80vh]">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{selectedEntry.title}</h2>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close ✕
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedEntry.createdAt
                  ? selectedEntry.createdAt.toLocaleString()
                  : ""}
              </p>
              <div className="whitespace-pre-wrap text-foreground">
                {selectedEntry.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;