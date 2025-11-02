import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Clock, Video, Phone, MessageSquare, CheckCircle2 } from "lucide-react";

const SessionTherapy = () => {
  const upcomingSessions = [
    {
      therapist: "Dr. Priya Sharma",
      specialty: "Anxiety & Stress Management",
      date: "March 20, 2025",
      time: "3:00 PM - 4:00 PM",
      type: "Video Call",
      status: "confirmed"
    },
    {
      therapist: "Dr. Rajesh Kumar",
      specialty: "Depression & Mood Disorders",
      date: "March 25, 2025",
      time: "11:00 AM - 12:00 PM",
      type: "Phone Call",
      status: "confirmed"
    }
  ];

  const availableTherapists = [
    {
      name: "Dr. Priya Sharma",
      specialty: "Anxiety, Stress, OCD",
      experience: "12 years",
      languages: "English, Hindi",
      rating: 4.9,
      sessions: 2500,
      image: "👩‍⚕️"
    },
    {
      name: "Dr. Rajesh Kumar",
      specialty: "Depression, Relationships",
      experience: "10 years",
      languages: "English, Hindi, Tamil",
      rating: 4.8,
      sessions: 2200,
      image: "👨‍⚕️"
    },
    {
      name: "Dr. Ananya Patel",
      specialty: "Teen & Young Adult Counseling",
      experience: "8 years",
      languages: "English, Hindi, Gujarati",
      rating: 4.9,
      sessions: 1800,
      image: "👩‍⚕️"
    },
    {
      name: "Dr. Vikram Singh",
      specialty: "Career & Academic Stress",
      experience: "15 years",
      languages: "English, Hindi, Punjabi",
      rating: 4.7,
      sessions: 3000,
      image: "👨‍⚕️"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-wellness-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Professional Therapy Sessions
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with licensed therapists and psychologists for personalized online therapy
          </p>
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Upcoming Sessions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingSessions.map((session, index) => (
                <Card key={index} className="shadow-wellness border-wellness-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {session.therapist}
                        </h3>
                        <p className="text-sm text-muted-foreground">{session.specialty}</p>
                      </div>
                      <Badge className="bg-wellness-primary text-primary-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {session.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-wellness-primary" />
                        {session.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-wellness-primary" />
                        {session.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {session.type === "Video Call" ? (
                          <Video className="w-4 h-4 text-wellness-primary" />
                        ) : (
                          <Phone className="w-4 h-4 text-wellness-primary" />
                        )}
                        {session.type}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="wellness" size="sm" className="flex-1">
                        Join Session
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Therapists */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Find Your Therapist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {availableTherapists.map((therapist, index) => (
              <Card 
                key={index} 
                className="shadow-wellness border-wellness-primary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{therapist.image}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{therapist.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium text-foreground">{therapist.experience}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Languages:</span>
                      <p className="font-medium text-foreground">{therapist.languages}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 bg-wellness-calm/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="font-semibold text-foreground">{therapist.rating}</p>
                        <p className="text-xs text-muted-foreground">{therapist.sessions}+ sessions</p>
                      </div>
                    </div>
                    <Button variant="wellness" size="sm">
                      Book Session
                    </Button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Audio
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-12 bg-gradient-warm border-none">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4 text-accent-foreground">
              💡 How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-accent-foreground/90">
              <div>
                <div className="text-3xl mb-2">1️⃣</div>
                <p className="font-medium mb-1">Choose a Therapist</p>
                <p className="text-sm">Browse profiles and select based on your needs</p>
              </div>
              <div>
                <div className="text-3xl mb-2">2️⃣</div>
                <p className="font-medium mb-1">Book Your Session</p>
                <p className="text-sm">Pick a convenient date and time</p>
              </div>
              <div>
                <div className="text-3xl mb-2">3️⃣</div>
                <p className="font-medium mb-1">Start Healing</p>
                <p className="text-sm">Join from anywhere via video, phone, or chat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionTherapy;