import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="text-center animate-fade-in">
        <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Welcome to MannSahay
        </h1>
        <p className="text-xl text-muted-foreground mb-8">Your mental wellness journey starts here</p>
        <Button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default Index;
