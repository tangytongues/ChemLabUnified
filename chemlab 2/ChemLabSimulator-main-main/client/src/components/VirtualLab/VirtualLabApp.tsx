import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Equipment } from "./Equipment";
import { WorkBench } from "./WorkBench";
import { Chemical } from "./Chemical";
import { Controls } from "./Controls";
import { ResultsPanel } from "./ResultsPanel";
import { ExperimentSteps } from "./ExperimentSteps";
import {
  FlaskConical,
  Atom,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Beaker,
  TestTube,
  Thermometer,
  Droplets,
  Trophy,
  CheckCircle,
} from "lucide-react";
import type { ExperimentStep } from "@shared/schema";
import { useUpdateProgress } from "@/hooks/use-experiments";

interface EquipmentPosition {
  id: string;
  x: number;
  y: number;
  chemicals: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    concentration: string;
  }>;
}

interface Result {
  id: string;
  type: "success" | "warning" | "error" | "reaction";
  title: string;
  description: string;
  timestamp: string;
  calculation?: {
    volumeAdded?: number;
    totalVolume?: number;
    concentration?: string;
    molarity?: number;
    moles?: number;
    reaction?: string;
    yield?: number;
    ph?: number;
    balancedEquation?: string;
    reactionType?: string;
    products?: string[];
    mechanism?: string[];
    thermodynamics?: {
      deltaH?: number;
      deltaG?: number;
      equilibriumConstant?: number;
    };
  };
}

interface VirtualLabProps {
  step: ExperimentStep;
  onStepComplete: () => void;
  isActive: boolean;
  stepNumber: number;
  totalSteps: number;
  experimentTitle: string;
  allSteps: ExperimentStep[];
  experimentId?: number;
}

function VirtualLabApp({
  step,
  onStepComplete,
  isActive,
  stepNumber,
  totalSteps,
  experimentTitle,
  allSteps,
  experimentId = 1,
}: VirtualLabProps) {
  const [equipmentPositions, setEquipmentPositions] = useState<
    EquipmentPosition[]
  >([]);
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [showSteps, setShowSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(stepNumber);
  const [measurements, setMeasurements] = useState({
    volume: 0,
    concentration: 0,
    ph: 7,
    molarity: 0,
    moles: 0,
    temperature: 25,
  });
  const [isHeating, setIsHeating] = useState(false);
  const [heatingTime, setHeatingTime] = useState(0);
  const [targetTemperature, setTargetTemperature] = useState(25);
  const [actualTemperature, setActualTemperature] = useState(25);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentGuidedStep, setCurrentGuidedStep] = useState(1);
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  const [showWrongStepModal, setShowWrongStepModal] = useState(false);
  const [wrongStepMessage, setWrongStepMessage] = useState("");
  const [completionTime, setCompletionTime] = useState<Date | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const updateProgress = useUpdateProgress();

  // Use dynamic experiment steps from allSteps prop
  const experimentSteps = allSteps.map((stepData, index) => ({
    id: stepData.id,
    title: stepData.title,
    description: stepData.description,
    duration: parseInt(stepData.duration?.replace(/\D/g, "") || "5"),
    status: (stepData.id === currentStep
      ? "active"
      : stepData.id < currentStep
        ? "completed"
        : "pending") as "active" | "completed" | "pending",
    requirements: stepData.safety
      ? [stepData.safety]
      : [`${stepData.title} requirements`],
  }));

  // Experiment-specific chemicals and equipment
  const experimentChemicals = useMemo(() => {
    if (experimentTitle.includes("Aspirin")) {
      return [
        {
          id: "salicylic_acid",
          name: "Salicylic Acid",
          formula: "C₇H₆O₃",
          color: "#F8F8FF",
          concentration: "2.0 g",
          volume: 25,
        },
        {
          id: "acetic_anhydride",
          name: "Acetic Anhydride",
          formula: "(CH₃CO)₂O",
          color: "#DDA0DD",
          concentration: "5 mL",
          volume: 50,
        },
        {
          id: "phosphoric_acid",
          name: "Phosphoric Acid",
          formula: "H₃PO₄",
          color: "#FFA500",
          concentration: "Catalyst",
          volume: 10,
        },
        {
          id: "distilled_water",
          name: "Distilled Water",
          formula: "H₂O",
          color: "#87CEEB",
          concentration: "Pure",
          volume: 100,
        },
      ];
    } else if (experimentTitle.includes("Acid-Base")) {
      return [
        {
          id: "hcl",
          name: "Hydrochloric Acid",
          formula: "HCl",
          color: "#FFE135",
          concentration: "0.1 M",
          volume: 25,
        },
        {
          id: "naoh",
          name: "Sodium Hydroxide",
          formula: "NaOH",
          color: "#8B5A9B",
          concentration: "0.1 M",
          volume: 50,
        },
        {
          id: "phenol",
          name: "Phenolphthalein",
          formula: "C₂₀H₁₄O₄",
          color: "#FFB6C1",
          concentration: "Indicator",
          volume: 10,
        },
      ];
    } else if (experimentTitle.includes("Equilibrium")) {
      return [
        {
          id: "cocl2",
          name: "Cobalt(II) Chloride",
          formula: "CoCl₂",
          color: "#FFB6C1",
          concentration: "0.1 M",
          volume: 30,
        },
        {
          id: "hcl_conc",
          name: "Concentrated HCl",
          formula: "HCl",
          color: "#87CEEB",
          concentration: "12 M",
          volume: 20,
        },
        {
          id: "water",
          name: "Distilled Water",
          formula: "H₂O",
          color: "transparent",
          concentration: "Pure",
          volume: 100,
        },
        {
          id: "ice",
          name: "Ice Bath",
          formula: "H₂O(s)",
          color: "#E0F6FF",
          concentration: "0°C",
          volume: 50,
        },
      ];
    }
    return [];
  }, [experimentTitle]);

  const experimentEquipment = useMemo(() => {
    if (experimentTitle.includes("Aspirin")) {
      return [
        {
          id: "erlenmeyer_flask",
          name: "125mL Erlenmeyer Flask",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-blue-600"
            >
              <path
                d="M12 6h12v8l4 12H8l4-12V6z"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(59, 130, 246, 0.1)"
              />
              <path d="M10 6h16" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="20" r="2" fill="rgba(59, 130, 246, 0.3)" />
            </svg>
          ),
        },
        {
          id: "thermometer",
          name: "Thermometer",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-red-600"
            >
              <rect
                x="16"
                y="4"
                width="4"
                height="20"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(239, 68, 68, 0.1)"
              />
              <circle cx="18" cy="28" r="4" fill="currentColor" />
              <path d="M18 24v-16" stroke="currentColor" strokeWidth="1" />
            </svg>
          ),
        },
        {
          id: "graduated_cylinder",
          name: "Graduated Cylinder",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-green-600"
            >
              <rect
                x="12"
                y="6"
                width="12"
                height="24"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(34, 197, 94, 0.1)"
              />
              <path
                d="M14 12h8M14 16h8M14 20h8M14 24h8"
                stroke="currentColor"
                strokeWidth="1"
              />
              <rect
                x="10"
                y="4"
                width="16"
                height="4"
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          ),
        },
        {
          id: "water_bath",
          name: "Water Bath",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-orange-600"
            >
              <rect
                x="4"
                y="12"
                width="28"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(249, 115, 22, 0.1)"
              />
              <path
                d="M8 20c2-2 4-2 6 0s4 2 6 0s4-2 6 0s4 2 6 0"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="18" cy="8" r="2" fill="rgba(249, 115, 22, 0.5)" />
              <path d="M16 6l4 4" stroke="currentColor" strokeWidth="1" />
            </svg>
          ),
        },
      ];
    } else if (experimentTitle.includes("Acid-Base")) {
      return [
        { id: "burette", name: "50mL Burette", icon: <TestTube size={36} /> },
        {
          id: "conical_flask",
          name: "250mL Conical Flask",
          icon: <FlaskConical size={36} />,
        },
        {
          id: "magnetic_stirrer",
          name: "Magnetic Stirrer",
          icon: <Beaker size={36} />,
        },
      ];
    } else if (experimentTitle.includes("Equilibrium")) {
      return [
        { id: "test_tubes", name: "Test Tubes", icon: <TestTube size={36} /> },
        { id: "beakers", name: "Beakers", icon: <Beaker size={36} /> },
        {
          id: "hot_water_bath",
          name: "Hot Water Bath",
          icon: <Thermometer size={36} />,
        },
        { id: "ice_bath", name: "Ice Bath", icon: <FlaskConical size={36} /> },
      ];
    }
    return [];
  }, [experimentTitle]);

  // Guided steps for Aspirin Synthesis
  const aspirinGuidedSteps = [
    {
      id: 1,
      title: "Set up Erlenmeyer Flask",
      instruction: "Drag the 125mL Erlenmeyer Flask to the workbench",
      requiredEquipment: "erlenmeyer_flask",
      completed: false,
    },
    {
      id: 2,
      title: "Add Salicylic Acid",
      instruction: "Drag 2.0g of Salicylic Acid into the Erlenmeyer Flask",
      requiredChemical: "salicylic_acid",
      targetEquipment: "erlenmeyer_flask",
      completed: false,
    },
    {
      id: 3,
      title: "Add Acetic Anhydride",
      instruction:
        "Add 5mL of Acetic Anhydride to the flask using the graduated cylinder",
      requiredChemical: "acetic_anhydride",
      targetEquipment: "erlenmeyer_flask",
      completed: false,
    },
    {
      id: 4,
      title: "Add Catalyst",
      instruction: "Add 2-3 drops of Phosphoric Acid as catalyst",
      requiredChemical: "phosphoric_acid",
      targetEquipment: "erlenmeyer_flask",
      completed: false,
    },
    {
      id: 5,
      title: "Set up Water Bath",
      instruction: "Drag the Water Bath to the workbench and heat to 85°C",
      requiredEquipment: "water_bath",
      completed: false,
    },
    {
      id: 6,
      title: "Heat Reaction",
      instruction: "Place the flask in the water bath and heat for 15 minutes",
      completed: false,
    },
  ];

  // Temperature simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isHeating) {
      interval = setInterval(() => {
        setHeatingTime((prev) => {
          const newTime = prev + 1;

          // Check if heating is complete (15 minutes = 900 seconds)
          if (newTime >= 900 && experimentTitle.includes("Aspirin")) {
            const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
            if (currentStep?.id === 6) {
              // Heat Reaction step
              setCurrentGuidedStep((prev) => prev + 1);
              setToastMessage("✓ Heating complete! Step 6 finished!");
              setTimeout(() => setToastMessage(null), 3000);
              setIsHeating(false);
            }
          }

          return newTime;
        });

        // Gradually increase temperature towards target
        setActualTemperature((prev) => {
          const diff = targetTemperature - prev;
          if (Math.abs(diff) < 1) return targetTemperature;
          return prev + (diff > 0 ? 2 : -2); // Heat/cool at 2°C per second
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isHeating,
    targetTemperature,
    currentGuidedStep,
    experimentTitle,
    aspirinGuidedSteps,
  ]);

  // Check for experiment completion
  useEffect(() => {
    if (
      experimentTitle.includes("Aspirin") &&
      currentGuidedStep > aspirinGuidedSteps.length
    ) {
      setExperimentCompleted(true);
      setCompletionTime(new Date());
      setShowCompletionModal(true);

      // Update experiment progress
      updateProgress.mutate({
        experimentId,
        currentStep: allSteps.length,
        completed: true,
        progressPercentage: 100,
      });
    }
  }, [
    currentGuidedStep,
    experimentId,
    allSteps.length,
    experimentTitle,
    updateProgress,
  ]);

  const handleEquipmentDrop = useCallback(
    (id: string, x: number, y: number) => {
      setEquipmentPositions((prev) => {
        const existing = prev.find((pos) => pos.id === id);

        // Flexible positioning with smart defaults for first-time placement
        let finalX = x;
        let finalY = y;

        // Ensure equipment stays within reasonable bounds
        const minX = 60;
        const maxX = 800;
        const minY = 60;
        const maxY = 450;

        finalX = Math.max(minX, Math.min(maxX, x));
        finalY = Math.max(minY, Math.min(maxY, y));

        if (existing) {
          return prev.map((pos) =>
            pos.id === id ? { ...pos, x: finalX, y: finalY } : pos,
          );
        }

        // Check if this completes a guided step for Aspirin Synthesis
        if (experimentTitle.includes("Aspirin")) {
          const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
          if (currentStep?.requiredEquipment === id) {
            setCurrentGuidedStep((prev) => prev + 1);
            setToastMessage(`✓ Step ${currentGuidedStep} completed!`);
            setTimeout(() => setToastMessage(null), 3000);

            // Auto-start heating when water bath is placed (step 5)
            if (id === "water_bath" && currentGuidedStep === 5) {
              setTimeout(() => {
                handleStartHeating(85);
                setToastMessage("🔥 Water bath heating automatically started!");
                setTimeout(() => setToastMessage(null), 3000);
              }, 1000);
            }
          }
        }

        // Add equipment at user-specified position
        return [...prev, { id, x: finalX, y: finalY, chemicals: [] }];
      });
    },
    [experimentTitle, currentGuidedStep, aspirinGuidedSteps],
  );

  const handleChemicalSelect = (id: string) => {
    setSelectedChemical(selectedChemical === id ? null : id);
  };

  const handleChemicalDrop = (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => {
    const chemical = experimentChemicals.find((c) => c.id === chemicalId);
    if (!chemical) return;

    setEquipmentPositions((prev) =>
      prev.map((pos) => {
        if (pos.id === equipmentId) {
          const newChemicals = [
            ...pos.chemicals,
            {
              id: chemicalId,
              name: chemical.name,
              color: chemical.color,
              amount,
              concentration: chemical.concentration,
            },
          ];

          // Show success toast
          setToastMessage(
            `Added ${amount}mL of ${chemical.name} to ${equipmentId}`,
          );
          setTimeout(() => setToastMessage(null), 3000);

          // Check if this completes a guided step for Aspirin Synthesis
          if (experimentTitle.includes("Aspirin")) {
            const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
            if (
              currentStep?.requiredChemical === chemicalId &&
              currentStep?.targetEquipment === equipmentId
            ) {
              setCurrentGuidedStep((prev) => prev + 1);
              setToastMessage(`✓ Step ${currentGuidedStep} completed!`);
              setTimeout(() => setToastMessage(null), 3000);
            }
          }

          // Calculate reaction if chemicals are mixed
          if (newChemicals.length >= 2) {
            const totalVolume = newChemicals.reduce(
              (sum, c) => sum + c.amount,
              0,
            );
            handleReaction(newChemicals, totalVolume, equipmentId);
          }

          return { ...pos, chemicals: newChemicals };
        }
        return pos;
      }),
    );

    setSelectedChemical(null);
  };

  const handleReaction = (
    chemicals: any[],
    totalVolume: number,
    equipmentId?: string,
  ) => {
    // Check for Aspirin synthesis reaction
    const hasSalicylicAcid = chemicals.some((c) => c.id === "salicylic_acid");
    const hasAceticAnhydride = chemicals.some(
      (c) => c.id === "acetic_anhydride",
    );
    const hasPhosphoricAcid = chemicals.some((c) => c.id === "phosphoric_acid");

    if (hasSalicylicAcid && hasAceticAnhydride && hasPhosphoricAcid) {
      const result: Result = {
        id: Date.now().toString(),
        type: "success",
        title: "Aspirin Synthesis Reaction",
        description:
          "Esterification reaction proceeding: Salicylic Acid + Acetic Anhydride → Aspirin + Acetic Acid",
        timestamp: new Date().toLocaleTimeString(),
        calculation: {
          reaction: "C₇H₆O₃ + (CH₃CO)₂O → C₉H₈O₄ + CH₃COOH",
          reactionType: "Esterification",
          balancedEquation:
            "Salicylic Acid + Acetic Anhydride → Acetylsalicylic Acid + Acetic Acid",
          products: ["Acetylsalicylic Acid (Aspirin)", "Acetic Acid"],
          yield: 85,
          mechanism: [
            "1. Phosphoric acid protonates the carbonyl oxygen of acetic anhydride",
            "2. Nucleophilic attack by salicylic acid hydroxyl group",
            "3. Tetrahedral intermediate formation",
            "4. Elimination of acetic acid",
            "5. Formation of aspirin ester bond",
          ],
        },
      };

      setResults((prev) => [...prev, result]);
    }
  };

  const handleStartExperiment = () => {
    setIsRunning(true);
    // Don't call onStepComplete here - progress should update on individual step completion
  };

  const handleStartHeating = (temperature: number = 85) => {
    setTargetTemperature(temperature);
    setIsHeating(true);
    setHeatingTime(0);
    setToastMessage(`🔥 Starting to heat to ${temperature}°C`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStopHeating = () => {
    setIsHeating(false);
    setTargetTemperature(25);
    setToastMessage("❄️ Cooling down to room temperature");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleSkipMinute = () => {
    setHeatingTime((prev) => prev + 60);
    setToastMessage("⏩ Skipped +1 minute");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleEquipmentRemove = (equipmentId: string) => {
    setEquipmentPositions((prev) =>
      prev.filter((pos) => pos.id !== equipmentId),
    );
    setToastMessage(`🗑️ Removed ${equipmentId} from workbench`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden flex"
      style={{ minHeight: "75vh" }}
    >
      {/* Step Procedure Side Panel */}
      <div
        className={`transition-all duration-300 ${showSteps ? "w-80" : "w-12"} flex-shrink-0`}
      >
        {showSteps ? (
          <div className="h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center">
                <List className="w-4 h-4 mr-2" />
                <span className="font-semibold text-sm">Procedure</span>
              </div>
              <button
                onClick={() => setShowSteps(false)}
                className="text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Guided Instructions for Aspirin Synthesis */}
              {experimentTitle.includes("Aspirin") ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg">
                    <h3 className="font-bold text-sm">Step-by-Step Guide</h3>
                    <p className="text-xs opacity-90">
                      Follow instructions to synthesize aspirin
                    </p>
                  </div>

                  {aspirinGuidedSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentGuidedStep === step.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : currentGuidedStep > step.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            currentGuidedStep === step.id
                              ? "bg-blue-500 text-white"
                              : currentGuidedStep > step.id
                                ? "bg-green-500 text-white"
                                : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {currentGuidedStep > step.id ? "✓" : step.id}
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-700 ml-8">
                        {step.instruction}
                      </p>

                      {currentGuidedStep === step.id && (
                        <div className="mt-2 ml-8 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                          <span className="font-medium text-yellow-800">
                            👆 Current step
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <ExperimentSteps
                    currentStep={currentStep}
                    steps={experimentSteps}
                    onStepClick={handleStepClick}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col items-center">
            <button
              onClick={() => setShowSteps(true)}
              className="p-3 text-gray-600 hover:text-blue-600 border-b border-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center">
              <div className="transform -rotate-90 text-xs font-medium text-gray-500 whitespace-nowrap">
                Procedure
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Lab Content */}
      <div className="flex-1 flex flex-col">
        {/* Heating Control Panel - Top Section */}
        {experimentTitle.includes("Aspirin") && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-red-600" />
                  Heating Control
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Current:</span>{" "}
                    {actualTemperature.toFixed(0)}°C
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Target:</span>{" "}
                    {targetTemperature}°C
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Time:</span>{" "}
                    {Math.floor(heatingTime / 60)}:
                    {(heatingTime % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    isHeating ? handleStopHeating() : handleStartHeating(85)
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isHeating
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  <Thermometer size={16} />
                  <span>{isHeating ? "Stop Heating" : "Heat to 85°C"}</span>
                </button>
                {isHeating &&
                  actualTemperature >= targetTemperature &&
                  heatingTime < 900 && (
                    <button
                      onClick={handleSkipMinute}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <span>⏩</span>
                      <span>Skip +1 min</span>
                    </button>
                  )}
              </div>
            </div>
            {isHeating && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">
                    Heating Progress
                  </span>
                  <span className="text-xs text-gray-600">
                    {Math.min(100, Math.round((heatingTime / 900) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (heatingTime / 900) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equipment Bar - Top Horizontal */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center">
              <Atom className="w-4 h-4 mr-2 text-blue-600" />
              {experimentTitle} - Equipment
            </h4>
            <div className="flex items-center space-x-2">
              {experimentTitle.includes("Aspirin") ? (
                <div className="text-xs text-gray-600 mr-3 flex items-center space-x-2">
                  <span>
                    Progress: {currentGuidedStep - 1}/
                    {aspirinGuidedSteps.length}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentGuidedStep - 1) / aspirinGuidedSteps.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600 mr-3">
                  Step {currentStep} of {experimentSteps.length}
                </div>
              )}
              <Controls
                isRunning={isRunning}
                onStart={handleStartExperiment}
                onStop={() => setIsRunning(false)}
                onReset={() => {
                  // Reset all experiment state to initial values
                  setEquipmentPositions([]);
                  setResults([]);
                  setIsRunning(false);
                  setCurrentStep(stepNumber);
                  setSelectedChemical(null);
                  setCurrentGuidedStep(1);
                  setIsHeating(false);
                  setHeatingTime(0);
                  setTargetTemperature(25);
                  setActualTemperature(25);
                  setExperimentCompleted(false);
                  setToastMessage("🔄 Experiment reset successfully!");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-2 overflow-x-auto pb-2">
            {experimentEquipment.map((equipment) => (
              <div key={equipment.id} className="flex-shrink-0">
                <Equipment
                  id={equipment.id}
                  name={equipment.name}
                  icon={equipment.icon}
                  onDrag={handleEquipmentDrop}
                  position={null}
                  chemicals={[]}
                  onChemicalDrop={handleChemicalDrop}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Work Area - Expanded */}
        <div className="flex-1 flex flex-col">
          {/* Lab Work Surface */}
          <div className="flex-1 p-6 relative">
            <WorkBench
              onDrop={handleEquipmentDrop}
              selectedChemical={selectedChemical}
              isRunning={isRunning}
              experimentTitle={experimentTitle}
              currentGuidedStep={currentGuidedStep}
            >
              {equipmentPositions.map((pos) => {
                const equipment = experimentEquipment.find(
                  (eq) => eq.id === pos.id,
                );
                return equipment ? (
                  <Equipment
                    key={pos.id}
                    id={pos.id}
                    name={equipment.name}
                    icon={equipment.icon}
                    onDrag={handleEquipmentDrop}
                    position={pos}
                    chemicals={pos.chemicals}
                    onChemicalDrop={handleChemicalDrop}
                    isHeating={isHeating && pos.id === "water_bath"}
                    actualTemperature={actualTemperature}
                    targetTemperature={targetTemperature}
                    heatingTime={heatingTime}
                    onStartHeating={() => handleStartHeating(85)}
                    onStopHeating={handleStopHeating}
                    onRemove={handleEquipmentRemove}
                  />
                ) : null;
              })}
            </WorkBench>
          </div>

          {/* Results Panel - When present */}
          {results.length > 0 && (
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-sm">
              <ResultsPanel results={results} onClear={handleClearResults} />
            </div>
          )}
        </div>

        {/* Reagents Bar - Bottom Horizontal */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3">
          <h4 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
            <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
            Chemical Reagents
          </h4>
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {experimentChemicals.map((chemical) => (
              <div key={chemical.id} className="flex-shrink-0">
                <Chemical
                  id={chemical.id}
                  name={chemical.name}
                  formula={chemical.formula}
                  color={chemical.color}
                  concentration={chemical.concentration}
                  volume={chemical.volume}
                  onSelect={handleChemicalSelect}
                  selected={selectedChemical === chemical.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Experiment Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                Congratulations! You have successfully completed the Aspirin
                Synthesis experiment.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Experiment completed at{" "}
                    {completionTime?.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualLabApp;
