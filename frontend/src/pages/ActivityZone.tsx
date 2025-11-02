import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, auth } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const itemUrls: { [key: string]: { [item: string]: string } } = {
  "Quick Games": {
    "Blob Opera":
      "https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw",
    Sync: "https://artsandculture.google.com/experiment/lip-sync/sgFpVi3us5Jy0g?hl=en",
    "talking Tours":
      "https://artsandculture.google.com/experiment/talking-tours/8AGlfzgsYmBeIA?hl=en",
    "Route 66 Rewind":
      "https://artsandculture.google.com/experiment/route-66-rewind/UgHweD53pyZKiA?hl=en",
  },
  "Yoga Snippets": {
    yoga: "https://www.youtube.com/user/yogawithadriene",
    dance: "https://open.spotify.com/",
    "5minworkout": "https://www.youtube.com/@5-minutefitness1",
    exercise:
      "https://www.youtube.com/results?search_query=tai+chi+for+beginners",
  },
  "Comedy Corner": {
    "Daily Dose of Laughter":
      "https://www.youtube.com/results?search_query=progressive+muscle+relaxation",
    "Feel-Good Stories": "https://www.noisli.com/",
    "Wholesome Memes": "https://asoftmurmur.com/",
    "Uplifting Videos": "https://asoftmurmur.com/",
  },
  "Movies & Stories": {
    "Short Films": "https://music.youtube.com/",
    "Motivational Stories": "https://creators.spotify.com/",
    "Nature Documentaries": "https://open.spotify.com/",
    "Feel-Good Clips": "https://music.youtube.com/",
  },
};

const exploreAllUrls: { [key: string]: string } = {
  "Quick Games": "https://artsandculture.google.com/play?hl=en",
  "Yoga Snippets": "https://www.youtube.com/@5-minutefitness1",
  "Comedy Corner":
    "https://acts.kindness.org/lp/random-acts-of-kindness?gad_source=1&gad_campaignid=22249655901&gbraid=0AAAAADOKi4k_4SdOl5T85d7bTvZLNTlYS&gclid=CjwKCAjwiY_GBhBEEiwAFaghvvryTk8bx3VUsT1fgiI6tgIpt6VjJdnH2uvJFMKsPDR8CdlRRscOchoCUE8QAvD_BwE",
  "Movies & Stories": "https://open.spotify.com/",
};

const ActivityZone = () => {
  const [journalEntry, setJournalEntry] = useState("");
  const [gratitudeItems, setGratitudeItems] = useState([]);
  const [newGratitude, setNewGratitude] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);
  const [savingGratitude, setSavingGratitude] = useState(false);
  const [journalHistory, setJournalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const spotifyPlaylistUrl = "https://open.spotify.com/playlist/37i9dQZF1DXaImRpG7HXqp?si=ttPZCr2cTBq0J46EubL4VQ&pi=9fILMeydQxqx5";

  const openSpotify = () => {
    window.open(spotifyPlaylistUrl, "_blank", "noopener,noreferrer");
  };

  const blobopera =
    "https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw";

  const openblobopera = () => {
    window.open(blobopera, "_blank", "noopener,noreferrer");
  };

  const ArtBook =
    "https://artsandculture.google.com/experiment/art-coloring-book/1QGsh6vSfAQBgQ";

  const openArtBook = () => {
    window.open(ArtBook, "_blank", "noopener,noreferrer");
  };

  const CulturalGames = "https://artsandculture.google.com/play?hl=en";

  const openCulturalGames = () => {
    window.open(CulturalGames, "_blank", "noopener,noreferrer");
  };

  const Woolaroo =
    "https://artsandculture.google.com/experiment/woolaroo/ZwE32qj5E_ls6w?hl=en&cp=eyJsYW5nIjoiZW4iLCJobCI6ImVuIn0.";

  const openWoolaroo = () => {
    window.open(Woolaroo, "_blank", "noopener,noreferrer");
  };

  const activities = [
    {
      emoji: "🎮",
      title: "Quick Games",
      description: "Fun distractions to lighten your mood",
      items: ["Blob Opera", "Sync", "talking Tours", "Route 66 Rewind"],
    },
    {
      emoji: "🧘",
      title: "Yoga Snippets",
      description: "Gentle stretches and breathing exercises",
      items: ["yoga", "dance", "5minworkout", "exercise"],
    },
    {
      emoji: "🎤",
      title: "Comedy Corner",
      description: "Stand-up clips and funny stories",
      items: [
        "Daily Dose of Laughter",
        "Feel-Good Stories",
        "Wholesome Memes",
        "Uplifting Videos",
      ],
    },
    {
      emoji: "🎬",
      title: "Movies & Stories",
      description: "Escape for a while with good content",
      items: [
        "Short Films",
        "Motivational Stories",
        "Nature Documentaries",
        "Feel-Good Clips",
      ],
    },
  ];

  const quickActivities = [
    {
      emoji: "🫧",
      title: "Blob opera",
      description: "Watch and enjoy opera in fun way",
      onClick: openblobopera,
    },
    {
      emoji: "🌈",
      title: "Cultural Games",
      description: "Relax with amazing cultural games",
      onClick: openCulturalGames,
    },
    {
      emoji: "🎵",
      title: "Calming Sounds",
      description: "Nature sounds and peaceful music",
      onClick: openSpotify,
    },
    {
      emoji: "🎯",
      title: "Woolaroo",
      description: "new way to explore",
      onClick: openWoolaroo,
    },
  ];

  const journalPrompts = [
    "How am I feeling right now, and what might be behind these feelings?",
    "What's one thing that went well today, no matter how small?",
    "What would I say to a friend who was going through what I'm experiencing?",
    "What are three things I can control in my current situation?",
    "If today had a color, what would it be and why?",
  ];

  const m1 = "https://insighttimer.com/";
  const m1link = () => {
    window.open(m1, "_blank", "noopener,noreferrer");
  };

  const m2 = "https://www.youtube.com/results?search_query=progressive+muscle+relaxation";
  const m2link = () => {
    window.open(m2, "_blank", "noopener,noreferrer");
  };

  const m3 = "https://asoftmurmur.com/";
  const m3link = () => {
    window.open(m3, "_blank", "noopener,noreferrer");
  };

  const m4 = "https://www.noisli.com/";
  const m4link = () => {
    window.open(m4, "_blank", "noopener,noreferrer");
  };

  const mindfulnessExercises = [
    {
      title: "Meditation",
      description:
        "Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
      duration: "3 min",
      onClick: m1link,
    },
    {
      title: "Slight Movement",
      description: "Breathe in for 4, hold for 4, exhale for 4, hold for 4",
      duration: "5 min",
      onClick: m2link,
    },
    {
      title: "Relax Mind",
      description: "Slowly focus on each part of your body from head to toe",
      duration: "10 min",
      onClick: m3link,
    },
    {
      title: "Nature Sound",
      description:
        "Send good wishes to yourself, loved ones, and even difficult people",
      duration: "8 min",
      onClick: m4link,
    },
  ];

  useEffect(() => {
    let unsubscribe = () => {};

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoadingHistory(true);
        const entriesRef = collection(db, "journals", user.uid, "entries");
        const q = query(entriesRef, orderBy("createdAt", "desc"));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const history = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setJournalHistory(history);
            setLoadingHistory(false);
          },
          (error) => {
            console.error("Error fetching journal history: ", error);
            setLoadingHistory(false);
          }
        );
      } else {
        unsubscribe();
        setJournalHistory([]);
        setLoadingHistory(false);
      }
    });

    return () => {
      authUnsubscribe();
      unsubscribe();
    };
  }, []);

  const handleAddGratitude = () => {
    if (newGratitude.trim() && gratitudeItems.length < 5) {
      setGratitudeItems([...gratitudeItems, newGratitude.trim()]);
      setNewGratitude("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddGratitude();
    }
  };

  const handleSaveJournal = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to save your journal entry.");
      return;
    }
    if (!journalEntry.trim()) {
      alert("Write something before saving.");
      return;
    }

    setSavingJournal(true);
    try {
      const entriesRef = collection(db, "journals", user.uid, "entries");
      const title = journalEntry.split("\n").find(Boolean) || "Untitled";
      await addDoc(entriesRef, {
        title,
        content: journalEntry,
        createdISO: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      setJournalEntry("");
      alert("Journal entry saved.");
    } catch (err) {
      console.error("Save journal error:", err);
      alert("Failed to save. Check console.");
    } finally {
      setSavingJournal(false);
    }
  };

  const handleSaveGratitude = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to save gratitude.");
      return;
    }
    if (gratitudeItems.length === 0) {
      alert("Add at least one gratitude item first.");
      return;
    }

    setSavingGratitude(true);
    try {
      const gratRef = collection(db, "gratitudes", user.uid, "entries");
      await addDoc(gratRef, {
        items: gratitudeItems,
        createdISO: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      setGratitudeItems([]);
      alert("Gratitude saved.");
    } catch (err) {
      console.error("Save gratitude error:", err);
      alert("Failed to save gratitude.");
    } finally {
      setSavingGratitude(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🎯 Activity Zone
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Mindfulness in action - small steps to recenter yourself
          </p>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            When things feel overwhelming, sometimes all you need is a small step
            to find your center. These activities are designed to bring calm in
            just a few minutes.
          </p>
        </div>

        <Tabs defaultValue="journal" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-wellness-primary/20">
            <TabsTrigger value="journal" className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground">
              ✍️ Journal
            </TabsTrigger>
            <TabsTrigger value="mindfulness" className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground">
              🌬️ Mindfulness
            </TabsTrigger>
            <TabsTrigger value="gratitude" className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground">
              🙏 Gratitude
            </TabsTrigger>
            <TabsTrigger value="moodboosters" className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground">
              💫 Mood Boosters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            <Card className="shadow-wellness border-wellness-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>✍️</span>
                  Journaling Space
                </CardTitle>
                <p className="text-muted-foreground">Put your feelings into words. No judgment, just honest reflection.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Daily Prompts to Get Started:</h3>
                  <div className="grid gap-2">
                    {journalPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setJournalEntry(prompt + "\n\n")}
                        className="text-left p-3 rounded-lg bg-wellness-calm/30 hover:bg-wellness-calm/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Start writing your thoughts here... There's no right or wrong way to journal."
                    className="min-h-[200px] border-wellness-primary/30 focus:border-wellness-primary"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="wellness" onClick={() => setJournalEntry("")}>
                    Clear & Start Fresh
                  </Button>
                  <Button variant="calm" onClick={handleSaveJournal} disabled={savingJournal}>
                    {savingJournal ? "Saving..." : "Save Entry"}
                  </Button>
                </div>

                <div className="pt-6 border-t border-wellness-primary/20">
                  <h3 className="font-semibold mb-4 text-foreground">
                    Your Journal History
                  </h3>
                  
                  {loadingHistory && (
                    <p className="text-muted-foreground">Loading history...</p>
                  )}

                  {!loadingHistory && journalHistory.length === 0 && (
                    <p className="text-muted-foreground">
                      You haven't saved any journal entries yet.
                    </p>
                  )}

                  {!loadingHistory && journalHistory.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {journalHistory.map((entry: any) => (
                        <Card
                          key={entry.id}
                          className="bg-wellness-calm/30 border-wellness-primary/20"
                        >
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-foreground truncate">
                              {entry.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {entry.createdAt?.seconds
                                ? new Date(
                                    entry.createdAt.seconds * 1000
                                  ).toLocaleString()
                                : "Just now"}
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                              {entry.content}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mindfulness" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mindfulnessExercises.map((exercise) => (
                <Card key={exercise.title} className="shadow-wellness border-wellness-primary/20 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-foreground group-hover:text-wellness-primary transition-colors">{exercise.title}</h3>
                      <span className="text-sm text-muted-foreground bg-wellness-calm/50 px-2 py-1 rounded">{exercise.duration}</span>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{exercise.description}</p>
                    <Button variant="wellness" className="w-full" onClick={exercise.onClick}>Start Exercise</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-warm border-none">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4 text-accent-foreground">
                  🧘‍♀️ Mindfulness Reminder
                </h3>
                <p className="text-accent-foreground/90 leading-relaxed">
                  "Mindfulness isn't about emptying your mind or achieving
                  perfect calm. It's about being present with whatever you're
                  experiencing, with kindness and without judgment."
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gratitude" className="space-y-6">
            <Card className="shadow-wellness border-wellness-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><span>🙏</span>Daily Gratitude Practice</CardTitle>
                <p className="text-muted-foreground">Even on difficult days, there are small things worth appreciating.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">What are you grateful for today? (Add up to 5 items)</label>
                  <div className="flex gap-2">
                    <Textarea
                      value={newGratitude}
                      onChange={(e) => setNewGratitude(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="I'm grateful for..."
                      className="min-h-[60px] border-wellness-primary/30 focus:border-wellness-primary"
                      disabled={gratitudeItems.length >= 5}
                    />
                    <Button onClick={handleAddGratitude} disabled={!newGratitude.trim() || gratitudeItems.length >= 5} variant="wellness" className="self-end">Add</Button>
                  </div>
                </div>

                {gratitudeItems.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Today I'm grateful for:</h3>
                    <div className="space-y-2">
                      {gratitudeItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-wellness-calm/30 rounded-lg">
                          <span className="text-wellness-primary">💚</span>
                          <span className="flex-1 text-foreground">{item}</span>
                          <Button variant="ghost" size="sm" onClick={() => setGratitudeItems(gratitudeItems.filter((_, i) => i !== index))}>✕</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="calm" className="w-full" onClick={handleSaveGratitude} disabled={savingGratitude}>
                  {savingGratitude ? "Saving..." : "Save Gratitude Entry"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moodboosters" className="space-y-6">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                ⚡ GOOGLE ARTS AND CULTURE
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActivities.map((activity) => (
                  <Card
                    key={activity.title}
                    className="group hover:shadow-wellness transition-all duration-300 hover:-translate-y-1 cursor-pointer border-wellness-primary/20"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl mb-3 group-hover:animate-float">
                        {activity.emoji}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activity.description}
                      </p>
                      <Button
                        variant="calm"
                        size="sm"
                        className="w-full"
                        onClick={activity.onClick}
                      >
                        Try Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {activities.map((category, index) => (
                <Card
                  key={category.title}
                  className="shadow-wellness border-wellness-primary/20 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="bg-gradient-warm">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">{category.emoji}</span>
                      <span className="text-accent-foreground">
                        {category.title}
                      </span>
                    </CardTitle>
                    <p className="text-accent-foreground/80">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <a
                          key={item}
                          href={itemUrls[category.title]?.[item] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-wellness-calm/30 hover:bg-wellness-calm/50 transition-colors cursor-pointer group"
                        >
                          <span className="text-foreground group-hover:text-wellness-primary transition-colors">
                            {item}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            ▶️
                          </span>
                        </a>
                      ))}
                    </div>

                    <Button asChild variant="wellness" className="w-full mt-6">
                      <a
                        href={exploreAllUrls[category.title] || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explore All {category.title}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-12 bg-gradient-wellness text-primary-foreground border-none">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">💡 Wellness Tip</h3>
                <p className="text-lg leading-relaxed">"Taking a few minutes to laugh, stretch, or play isn't procrastination — it's maintenance for your mind. You deserve these moments of joy."</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ActivityZone;