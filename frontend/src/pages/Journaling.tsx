// Journaling.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Journaling = () => {
  const { entryId } = useParams(); // route: /journaling/:entryId
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) return;
      try {
        // This assumes you have the current user's UID stored in local state or route. 
        // If you want to avoid passing uid, you can store entries's docId globally or fetch by other means.
        const user = (await import('@/firebaseConfig')).auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "journals", user.uid, "entries", entryId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setEntry({
            id: snap.id,
            title: data.title || "Untitled",
            content: data.content || "",
            createdAt: data.createdAt ? data.createdAt.toDate() : (data.createdISO ? new Date(data.createdISO) : null)
          });
        } else {
          setEntry({ notFound: true });
        }
      } catch (err) {
        console.error("Fetch entry error:", err);
      }
    };

    fetchEntry();
  }, [entryId]);

  if (!entry) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }
  if (entry.notFound) {
    return <div className="p-8 text-center text-muted-foreground">Entry not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>{entry.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{entry.createdAt ? entry.createdAt.toLocaleString() : ""}</p>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{entry.content}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Journaling;
