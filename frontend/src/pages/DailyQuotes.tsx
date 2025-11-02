import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DailyQuotes = () => {
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
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ✨ Daily Quotes
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Gentle nudges and sparks of motivation
          </p>
          <p className="text-sm text-muted-foreground">
            {todaysDate}
          </p>
        </div>

        {/* Quote Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "wellness" : "calm"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Main Quote Display */}
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

        {/* Navigation */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <Button 
            variant="calm" 
            onClick={prevQuote}
            disabled={filteredQuotes.length <= 1}
          >
            ← Previous
          </Button>
          <span className="text-muted-foreground">
            {currentQuote + 1} of {filteredQuotes.length}
          </span>
          <Button 
            variant="calm" 
            onClick={nextQuote}
            disabled={filteredQuotes.length <= 1}
          >
            Next →
          </Button>
        </div>

        {/* Quote Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredQuotes.map((quote, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:shadow-wellness hover:-translate-y-1 ${
                index === currentQuote 
                  ? 'border-wellness-primary shadow-wellness' 
                  : 'border-wellness-primary/20'
              }`}
              onClick={() => setCurrentQuote(index)}
            >
              <CardContent className="p-6">
                <blockquote className="text-sm leading-relaxed text-muted-foreground mb-4 line-clamp-3">
                  "{quote.text}"
                </blockquote>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-wellness-primary">
                    — {quote.author}
                  </p>
                  <span className="text-xs px-2 py-1 bg-wellness-calm/30 text-wellness-primary rounded">
                    {quote.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Motivational Section */}
        <Card className="mt-12 bg-gradient-wellness text-primary-foreground border-none">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">
              🌟 Remember
            </h3>
            <p className="text-lg leading-relaxed">
              Better days are always possible. You've got this, and you're not alone on this journey. 
              Take it one moment at a time. 💛
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyQuotes;