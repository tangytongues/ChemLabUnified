import { useParams } from "wouter";
import React, { useState, useEffect } from "react";
import {
  useExperiment,
  useExperimentProgress,
  useUpdateProgress,
} from "@/hooks/use-experiments";
import { getUserId } from "@/lib/utils";
import Header from "@/components/header";
import VirtualLabApp from "@/components/VirtualLab/VirtualLabApp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Thermometer,
  Play,
  Pause,
} from "lucide-react";
import { Link } from "wouter";
import type { ExperimentStep } from "@shared/schema";

export default function Experiment() {
  const { id } = useParams<{ id: string }>();
  const experimentId = parseInt(id || "1");

  const {
    data: experiment,
    isLoading: experimentLoading,
    error,
  } = useExperiment(experimentId);

  // Debug logging and timeout
  React.useEffect(() => {
    console.log("Experiment debug:", {
      experimentId,
      experimentLoading,
      experiment,
      error,
    });

    // Force end loading state after 3 seconds
    if (experimentLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [experimentId, experimentLoading, experiment, error]);
  const { data: progress } = useExperimentProgress(experimentId);
  const updateProgressMutation = useUpdateProgress();

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.currentStep);
    }
  }, [progress]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && experimentStarted) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer, experimentStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    if (experimentStarted) {
      setIsRunning(!isRunning);
    }
  };

  const handleStartExperiment = () => {
    setExperimentStarted(true);
    setIsRunning(true);
  };

  const handleCompleteStep = () => {
    updateProgressMutation.mutate({
      experimentId: experimentId,
      currentStep: Math.min(
        currentStep + 1,
        currentExperiment?.stepDetails.length || 0 - 1,
      ),
      completed:
        currentStep === (currentExperiment?.stepDetails.length || 0) - 1,
      progressPercentage: Math.round(
        ((currentStep + 2) / (currentExperiment?.stepDetails.length || 1)) *
          100,
      ),
    });

    if (currentStep < (currentExperiment?.stepDetails.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < (currentExperiment?.stepDetails.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    // Disable going back to previous steps - steps are linear and non-reversible
    return;
  };

  if (experimentLoading && !loadingTimeout) {
    return (
      <div className="bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading experiment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback experiment data for experiment 3 (Chemical Equilibrium)
  const fallbackExperiment = {
    id: 3,
    title: "Chemical Equilibrium",
    description:
      "Investigate Le Chatelier's principle by observing how changes in concentration, temperature, and pressure affect chemical equilibrium.",
    stepDetails: [
      {
        id: 1,
        title: "Prepare Solutions",
        description:
          "Take a test tube and add cobalt chloride crystals. Add distilled water slowly and stir until it dissolves.",
        duration: "5 minutes",
        completed: false,
      },
      {
        id: 2,
        title: "Add Concentrated HCl",
        description:
          "Slowly add drops of concentrated HCl to the cobalt solution. Observe the color change from pink to blue.",
        duration: "8 minutes",
        completed: false,
      },
      {
        id: 3,
        title: "Dilute with Water",
        description:
          "Add distilled water to the blue solution. Observe the color change back to pink.",
        duration: "5 minutes",
        completed: false,
      },
      {
        id: 4,
        title: "Temperature Effect - Heating",
        description:
          "Heat the pink solution in a water bath. Observe how temperature affects equilibrium.",
        duration: "10 minutes",
        completed: false,
      },
      {
        id: 5,
        title: "Temperature Effect - Cooling",
        description:
          "Cool the heated solution in an ice bath. Observe the equilibrium shift.",
        duration: "8 minutes",
        completed: false,
      },
      {
        id: 6,
        title: "Record Observations",
        description:
          "Document all color changes and relate them to Le Chatelier's principle.",
        duration: "7 minutes",
        completed: false,
      },
    ],
  };

  // Use fallback if experiment is not loaded and timeout has passed
  const currentExperiment =
    experiment ||
    (loadingTimeout && experimentId === 3 ? fallbackExperiment : null);

  if (
    !currentExperiment ||
    !currentExperiment.stepDetails ||
    currentExperiment.stepDetails.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Experiment Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested experiment (ID: {experimentId}) could not be found.
              Please try again.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = currentExperiment.stepDetails[currentStep];
  const progressPercentage = Math.round(
    ((currentStep + 1) / currentExperiment.stepDetails.length) * 100,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experiments
          </Link>
        </div>

        {/* Experiment Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentExperiment.title}
          </h1>
          <p className="text-gray-600 mb-4">{currentExperiment.description}</p>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-blue-600 font-semibold">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Main Lab Area - Full Width */}
        <div className="w-full relative">
          {/* Experiment Not Started Overlay */}
          {!experimentStarted && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 max-w-md">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to Start?
                </h3>
                <p className="text-gray-600 mb-6">
                  Click on the "Start Experiment" button to get started with the
                  experiment!
                </p>
                <button
                  onClick={handleStartExperiment}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors mx-auto"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Experiment</span>
                </button>
              </div>
            </div>
          )}

          <Card className="min-h-[80vh]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl">
                  {experiment?.title} - Virtual Laboratory
                </span>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTimer}
                    className="flex items-center"
                  >
                    {isRunning ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {formatTime(timer)}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={true}
                      size="sm"
                      className="opacity-50 cursor-not-allowed"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-2 px-2">
                      <span className="text-sm text-gray-600">
                        {currentStep + 1} /{" "}
                        {experiment?.stepDetails.length || 0}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                        STEP {currentStep + 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleNextStep}
                      disabled={
                        currentStep ===
                        (experiment?.stepDetails.length || 1) - 1
                      }
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Interactive Virtual Lab - Full Size */}
              <VirtualLabApp
                step={currentStepData}
                onStepComplete={handleCompleteStep}
                isActive={isActive}
                stepNumber={currentStep + 1}
                totalSteps={currentExperiment.stepDetails.length}
                experimentTitle={currentExperiment.title}
                allSteps={currentExperiment.stepDetails}
                experimentStarted={experimentStarted}
                onStartExperiment={handleStartExperiment}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                onResetTimer={() => setTimer(0)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
