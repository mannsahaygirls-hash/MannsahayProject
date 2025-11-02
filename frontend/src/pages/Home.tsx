import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-wellness.jpg";

const Home = () => {
  const features = [
    {
      emoji: "💬",
      title: "Mann Sahay",
      description: "Your empathetic, culturally aware AI companion",
      path: "/chat"
    },
    {
      emoji: "🫂", 
      title: "Mann Mitra",
      description: "Connect with your digital buddy who talks like a real friend",
      path: "/mannmitra"
    },
    {
      emoji: "🎯",
      title: "Activity Zone", 
      description: "Journaling, mindfulness, and gratitude exercises for inner peace",
      path: "/activities"
    },
    {
      emoji: "✨",
      title: "Connect",
      description: "Gentle nudges and sparks of motivation for better days",
      path: "/quotes"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    {
      text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
      author: "A.A. Milne",
      category: "Strength"
    },
    {
      text: "The only way out is through.",
      author: "Robert Frost", 
      category: "Resilience"
    },
    {
      text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious. Having feelings doesn't make you a negative person. It makes you human.",
      author: "Lori Deschene",
      category: "Self-Compassion"
    },
    {
      text: "Healing isn't about erasing your past or your pain. It's about learning to live with both in a way that doesn't limit your present.",
      author: "Unknown",
      category: "Healing"
    },
    {
      text: "Your mental health is more important than your career, money, other's opinions, that event, your partner's mood, or anything else. Take care of yourself.",
      author: "Unknown",
      category: "Self-Care"
    },
    {
      text: "Progress, not perfection. Small steps every day lead to big changes over time.",
      author: "Unknown",
      category: "Growth"
    },
    {
      text: "It's okay to not be okay. What's not okay is staying that way and doing nothing about it.",
      author: "Unknown",
      category: "Action"
    },
    {
      text: "You've survived 100% of your worst days. You're doing great.",
      author: "Unknown",
      category: "Encouragement"
    }
  ];

  const categories = ["All", "Strength", "Resilience", "Self-Compassion", "Healing", "Self-Care", "Growth", "Action", "Encouragement"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredQuotes = selectedCategory === "All" 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);

  useEffect(() => {
    setCurrentQuote(0);
  }, [selectedCategory]);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % filteredQuotes.length);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + filteredQuotes.length) % filteredQuotes.length);
  };

  const todaysDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                🌿 Welcome to <span className="text-wellness-primary">MannSahay</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Your Digital Mental Wellness Companion
              </p>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                A private, judgment-free space for support, reflection, and mindfulness. 
                I'm here to listen, guide, and walk beside you on your wellness journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="wellness" size="lg" className="">
                  <Link to="/chat">Start Chatting 💬</Link>
                </Button>
                <Button asChild variant="wellness" size="lg" className="">
                  <Link to="/activities">Explore Activity Zone 🎯</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Wellness Toolkit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four spaces designed to support different aspects of your mental well-being
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="group hover:shadow-wellness transition-all duration-300 hover:-translate-y-2 border-wellness-primary/10"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 group-hover:animate-float">
                    {feature.emoji}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Button asChild variant="outline" className="w-full group-hover:border-wellness-primary group-hover:text-wellness-primary">
                    <Link to={feature.path}>Explore</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Quote Display */}
        <section>
        <div className="bg-gradient-calm p-4">
        <div className="container mx-auto max-w-4xl mt-5">
        <Card className="shadow-wellness border-wellness-primary/20 mb-8">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="relative">
                <span className="text-6xl text-wellness-primary/20 absolute -top-4 -left-4">"</span>
                <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground font-medium relative z-10">
                  {filteredQuotes[currentQuote]?.text}
                </blockquote>
                <span className="text-6xl text-wellness-primary/20 absolute -bottom-8 -right-4">"</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg text-wellness-primary font-semibold">
                  — {filteredQuotes[currentQuote]?.author}
                </p>
                <span className="inline-block px-3 py-1 bg-wellness-calm/50 text-wellness-primary text-sm rounded-full">
                  {filteredQuotes[currentQuote]?.category}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
        </section>

      

      {/* About Section */}
      <section className="py-20 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              About MannSahay 💛
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
              <p>
                Hey friend 👋, I'm MannSahay — your digital buddy who's always here when you need a safe space. 
                Think of me as that one friend who never judges, never interrupts with "same happened to me once," 
                and actually listens.
              </p>
              <p>
                This is your private corner to just be yourself — talk about what's on your mind, 
                breathe a little easier, and explore small ways to feel better.
              </p>
              <p className="text-sm text-muted-foreground/80 bg-card/60 p-4 rounded-lg border-l-4 border-wellness-accent">
                <strong>Disclaimer:</strong> MannSahay is designed to support your mental well-being and offer guidance, 
                but it is not a substitute for professional mental health care. If you feel overwhelmed, anxious, 
                or in crisis, please seek help from a qualified counselor, therapist, or helpline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;