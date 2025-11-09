import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BreathingVisualizer = () => {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || phase === 'idle') return;

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 6;
          } else {
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, count]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCount(4);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('idle');
    setCount(4);
  };

  const getCircleSize = () => {
    if (phase === 'inhale') return 'scale-150';
    if (phase === 'exhale') return 'scale-50';
    return 'scale-100';
  };

  const getPhaseText = () => {
    if (phase === 'idle') return 'Ready to begin';
    if (phase === 'inhale') return 'Breathe In';
    if (phase === 'hold') return 'Hold';
    return 'Breathe Out';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guided Breathing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div
            className={`w-32 h-32 rounded-full bg-primary/20 border-4 border-primary transition-transform duration-1000 ease-in-out ${getCircleSize()} flex items-center justify-center`}
          >
            <span className="text-4xl font-bold">{count}</span>
          </div>
          <p className="mt-6 text-xl font-medium">{getPhaseText()}</p>
        </div>

        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startExercise} className="w-full">
              Start Exercise
            </Button>
          ) : (
            <Button onClick={stopExercise} variant="outline" className="w-full">
              Stop
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Breathe in for 4 seconds</p>
          <p>• Hold for 4 seconds</p>
          <p>• Breathe out for 6 seconds</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreathingVisualizer;
