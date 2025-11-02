import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Users2, 
  Activity, 
  Heart, 
  Weight, 
  Ruler,
  Pill,
  Droplet
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal");

  // Personal Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Health Details
  const [chronicDisease, setChronicDisease] = useState("");
  const [vitaminDeficiency, setVitaminDeficiency] = useState("");
  const [haemoglobin, setHaemoglobin] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "health") {
      setActiveTab("health");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UserCircle className="w-8 h-8 text-wellness-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              User Profile
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your personal and health information
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-wellness-primary/20">
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground"
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Personal Details
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="data-[state=active]:bg-wellness-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="w-4 h-4 mr-2" />
              Health Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="shadow-wellness border-wellness-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-wellness-primary" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-wellness-primary" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-wellness-primary" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-wellness-primary" />
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min = {1}
                      value={age}
                      onChange={(e) =>  {
                         const newAge = Number(e.target.value);
                         if (newAge >= 1 || e.target.value === "") setAge(e.target.value);
                         }}
                      placeholder="Enter your age"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-wellness-primary" />
                      Gender
                    </Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="border-wellness-primary/30 focus:border-wellness-primary">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="wellness">Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card className="shadow-wellness border-wellness-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Health Information
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  This information helps us provide more personalized wellness support
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="chronic" className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-wellness-primary" />
                      Chronic Disease (if any)
                    </Label>
                    <Textarea
                      id="chronic"
                      value={chronicDisease}
                      onChange={(e) => setChronicDisease(e.target.value)}
                      placeholder="e.g., Diabetes, Hypertension, Asthma (Leave blank if none)"
                      className="min-h-[80px] border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="vitamin" className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-wellness-primary" />
                      Vitamin & Mineral Deficiency
                    </Label>
                    <Textarea
                      id="vitamin"
                      value={vitaminDeficiency}
                      onChange={(e) => setVitaminDeficiency(e.target.value)}
                      placeholder="e.g., Vitamin D, Iron, B12 (Leave blank if none)"
                      className="min-h-[80px] border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="haemoglobin" className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-wellness-primary" />
                      Haemoglobin Level (g/dL)
                    </Label>
                    <Input
                      id="haemoglobin"
                      value={haemoglobin}
                      onChange={(e) => setHaemoglobin(e.target.value)}
                      placeholder="e.g., 13.5"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-wellness-primary" />
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      min={1}
                      onChange={(e) => {
                         const newWeight = Number(e.target.value);
                         if (newWeight >= 1 || e.target.value === "") setWeight(e.target.value);
                         }}
                      placeholder="Enter your weight"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-wellness-primary" />
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      min = {1}
                      onChange={(e) =>  {
                         const newHeight = Number(e.target.value);
                         if (newHeight >= 1 || e.target.value === "") setHeight(e.target.value);
                         }}
                      placeholder="Enter your height"
                      className="border-wellness-primary/30 focus:border-wellness-primary"
                    />
                  </div>
                </div>

                <div className="bg-wellness-calm/20 p-4 rounded-lg border border-wellness-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong>Privacy Note:</strong> Your health information is private and secure. 
                    It's only used to provide you with better personalized wellness recommendations.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="wellness">Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;