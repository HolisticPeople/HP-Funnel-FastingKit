import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-background to-muted">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            7-Day Juice Fasting Supplement Kit
          </h1>
          <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto leading-relaxed">
            Experience enhanced detoxification with advanced supplements designed to support your fasting journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-background/80 backdrop-blur p-6 rounded-lg shadow-lg">
            <div className="text-accent text-3xl mb-4">✓</div>
            <h3 className="font-semibold text-lg mb-2 text-primary">Up to 400% Better Results</h3>
            <p className="text-muted-foreground">
              Enhanced toxin release and heavy metal removal
            </p>
          </div>

          <div className="bg-background/80 backdrop-blur p-6 rounded-lg shadow-lg">
            <div className="text-accent text-3xl mb-4">✓</div>
            <h3 className="font-semibold text-lg mb-2 text-primary">Smoother Process</h3>
            <p className="text-muted-foreground">
              More clarity, energy, and comfort during your fast
            </p>
          </div>

          <div className="bg-background/80 backdrop-blur p-6 rounded-lg shadow-lg">
            <div className="text-accent text-3xl mb-4">✓</div>
            <h3 className="font-semibold text-lg mb-2 text-primary">Complete Support</h3>
            <p className="text-muted-foreground">
              Liver, kidney, and lymphatic system cleansing
            </p>
          </div>
        </div>

        <div className="bg-background/90 backdrop-blur p-8 md:p-12 rounded-2xl shadow-xl mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Your Basic Kit Includes
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💧</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Magnesium</h4>
              <p className="text-sm text-muted-foreground">Essential mineral support</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Serraxym</h4>
              <p className="text-sm text-muted-foreground">Proteolytic enzymes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Fasting Elixir</h4>
              <p className="text-sm text-muted-foreground">Tachyon energy support</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground mb-8">
            Plus options to enhance with Iodine, NCD Zeolite, and Rad Neutral
          </p>
          <div className="text-center">
            <Button 
              size="lg" 
              className="px-12 text-lg"
              onClick={() => navigate("/kit-builder")}
            >
              Build Your Kit
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Based on Dr. Gabriel Cousens' advanced fasting protocol</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
