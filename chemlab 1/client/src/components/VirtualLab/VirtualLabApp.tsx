import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Equipment } from "./Equipment";
import { WorkBench } from "./WorkBench";
import { Chemical } from "./Chemical";
import { Controls } from "./Controls";
import { ResultsPanel } from "./ResultsPanel";
import { ExperimentSteps } from "./ExperimentSteps";
import { MeasurementsPanel } from "./MeasurementsPanel";
import { PHMeterSimulation } from "./PHMeterSimulation";
import { ChemicalFormulas } from "./ChemicalFormulas";
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
  console.log("🧪 VirtualLabApp rendering with:", {
    experimentTitle,
    stepNumber,
    totalSteps,
    stepTitle: step?.title,
  });
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
  const [phMeterCalibrated, setPhMeterCalibrated] = useState(false);
  const [showMeasurementsPanel, setShowMeasurementsPanel] = useState(false);
  const [currentPH, setCurrentPH] = useState(7.0);

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

  const experimentChemicals = useMemo(() => {
    // Return different chemicals based on experiment type
    if (experimentTitle.includes("Acid-Base")) {
      // Titration chemicals
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
          color: "#E0E0E0",
          concentration: "0.1 M",
          volume: 50,
        },
        {
          id: "phenol",
          name: "Phenolphthalein",
          formula: "C₂₀H₁₄O₄",
          color: "#FFB6C1",
          concentration: "Indicator",
          volume: 5,
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
    } else {
      // Aspirin synthesis chemicals
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
    }
  }, [experimentTitle]);

  const experimentEquipment = useMemo(() => {
    // Return different equipment based on experiment type
    if (experimentTitle.includes("Acid-Base")) {
      // Titration equipment
      return [
        {
          id: "burette",
          name: "50mL Burette",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-blue-600"
            >
              <rect
                x="16"
                y="4"
                width="4"
                height="24"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(59, 130, 246, 0.1)"
              />
              <circle cx="18" cy="30" r="2" fill="currentColor" />
              <path d="M14 8h8" stroke="currentColor" strokeWidth="1" />
              <path d="M14 12h8" stroke="currentColor" strokeWidth="1" />
              <path d="M14 16h8" stroke="currentColor" strokeWidth="1" />
            </svg>
          ),
        },
        {
          id: "conical_flask",
          name: "250mL Conical Flask",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-green-600"
            >
              <path
                d="M14 6h8v6l6 16H8l6-16V6z"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(34, 197, 94, 0.1)"
              />
              <path d="M12 6h12" stroke="currentColor" strokeWidth="2" />
            </svg>
          ),
        },
        {
          id: "magnetic_stirrer",
          name: "Magnetic Stirrer",
          icon: (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-blue-600"
            >
              <rect
                x="6"
                y="20"
                width="24"
                height="8"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(59, 130, 246, 0.1)"
              />
              <circle
                cx="18"
                cy="24"
                r="6"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <rect
                x="26"
                y="21"
                width="3"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <circle cx="28" cy="20" r="1" fill="green" />
            </svg>
          ),
        },
      ];
    } else {
      // Aspirin synthesis equipment
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
    }
  }, [experimentTitle]);

  // Check for experiment completion
  const checkExperimentCompletion = useCallback(() => {
    // Aspirin experiment completion: all guided steps completed + heating finished
    const allStepsCompleted =
      currentGuidedStep > (aspirinGuidedSteps?.length || 0);
    const heatingCompleted = heatingTime >= 15 * 60; // 15 minutes
    const hasRequiredChemicals = equipmentPositions.some(
      (pos) =>
        pos.chemicals.length >= 3 &&
        pos.chemicals.some((c) => c.id === "salicylic_acid") &&
        pos.chemicals.some((c) => c.id === "acetic_anhydride"),
    );

    if (
      allStepsCompleted &&
      heatingCompleted &&
      hasRequiredChemicals &&
      !experimentCompleted
    ) {
      setExperimentCompleted(true);
      setCompletionTime(new Date());
      setShowCompletionModal(true);
    }
  }, [
    currentGuidedStep,
    heatingTime,
    equipmentPositions,
    experimentCompleted,
    totalSteps,
    experimentId,
  ]);

  // Monitor completion conditions
  useEffect(() => {
    checkExperimentCompletion();
  }, [checkExperimentCompletion]);

  // Update progress when step changes (debounced to prevent excessive API calls)
  useEffect(() => {
    if (stepNumber > 1) {
      const timeoutId = setTimeout(() => {
        const progressPercentage = Math.round((stepNumber / totalSteps) * 100);
        // Temporarily disabled to debug fetch errors
        // updateProgress.mutate({
        //   experimentId,
        //   currentStep: stepNumber,
        //   completed: stepNumber >= totalSteps,
        //   progressPercentage,
        // });
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [stepNumber, totalSteps, experimentId]);

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
      instruction:
        "Place the flask in the water bath and heat for 15 minutes at 85°C",
      completed: false,
      requiresHeating: true,
      targetTemp: 85,
      duration: 15,
    },
  ];

  const handleEquipmentDrop = useCallback(
    (id: string, x: number, y: number) => {
      console.log(`handleEquipmentDrop called with: id=${id}, x=${x}, y=${y}`);

      // Ensure coordinates are valid numbers and within reasonable bounds
      const validX = Math.max(50, Math.min(x, window.innerWidth - 200));
      const validY = Math.max(50, Math.min(y, window.innerHeight - 200));

      setEquipmentPositions((prev) => {
        const existing = prev.find((pos) => pos.id === id);

        // Auto-positioning logic for realistic lab setup
        const getOptimalPosition = (
          equipmentId: string,
          dropX: number,
          dropY: number,
          existingPositions: any[],
        ) => {
          // For Acid-Base Titration experiment
          if (experimentTitle.includes("Acid-Base")) {
            const flask = existingPositions.find(
              (pos) => pos.id === "conical_flask",
            );
            const burette = existingPositions.find(
              (pos) => pos.id === "burette",
            );
            const stirrer = existingPositions.find(
              (pos) => pos.id === "magnetic_stirrer",
            );

            switch (equipmentId) {
              case "burette":
                // Always position burette above flask if flask exists, or use intelligent positioning
                if (flask) {
                  const autoX = flask.x;
                  const autoY = flask.y - 140; // Position closer to flask opening
                  const distanceToFlask = Math.sqrt(
                    (dropX - flask.x) ** 2 + (dropY - flask.y) ** 2,
                  );

                  // Auto-snap if dropped within 200px of flask OR if dropped in upper area
                  if (distanceToFlask < 200 || dropY < flask.y) {
                    setToastMessage(
                      "🔧 Burette positioned above flask for titration!",
                    );
                    setTimeout(() => setToastMessage(null), 3000);
                    return { x: autoX, y: Math.max(80, autoY) };
                  }
                }
                // Default center position for burette - centered on workbench
                return {
                  x: Math.min(Math.max(300, dropX), 450), // Centered horizontally
                  y: Math.max(60, Math.min(120, dropY)),
                };

              case "conical_flask":
                // Position flask in optimal titration position
                if (burette) {
                  const autoX = burette.x; // Perfect horizontal alignment
                  const autoY = burette.y + 140; // Position below burette with closer spacing
                  const distanceToBurette = Math.sqrt(
                    (dropX - burette.x) ** 2 + (dropY - burette.y) ** 2,
                  );

                  // Auto-snap if dropped within 200px of burette OR in lower area
                  if (distanceToBurette < 200 || dropY > burette.y) {
                    setToastMessage(
                      "🔧 Flask aligned below burette for titration!",
                    );
                    setTimeout(() => setToastMessage(null), 3000);
                    return {
                      x: autoX, // Perfect alignment
                      y: Math.max(180, Math.min(240, autoY)),
                    };
                  }
                }
                // Default center position for flask - centered on workbench
                return {
                  x: Math.min(Math.max(300, dropX), 450), // Centered horizontally
                  y: Math.min(Math.max(180, dropY), 240), // Position in middle area
                };

              case "magnetic_stirrer":
                // Position stirrer directly below conical flask if it exists
                if (flask) {
                  const autoX = flask.x; // Perfect horizontal alignment
                  const autoY = flask.y + 120; // Position lower below flask
                  const distanceToFlask = Math.sqrt(
                    (dropX - flask.x) ** 2 + (dropY - flask.y) ** 2,
                  );

                  // Auto-snap if dropped anywhere near flask or in lower area
                  if (
                    distanceToFlask < 200 ||
                    dropY > flask.y ||
                    Math.abs(dropX - flask.x) < 150
                  ) {
                    setToastMessage("🧲 Magnetic stirrer aligned below flask!");
                    setTimeout(() => setToastMessage(null), 3000);
                    return {
                      x: autoX, // Perfect alignment
                      y: Math.max(320, Math.min(370, autoY)),
                    };
                  }
                }
                // Default positioning if no flask present - centered on workbench
                return {
                  x: Math.min(Math.max(300, dropX), 450), // Centered horizontally
                  y: Math.min(Math.max(320, dropY), 370), // Position lower in workbench
                };

              default:
                return { x: dropX, y: dropY };
            }
          }

          // For Aspirin Synthesis experiment
          if (experimentTitle.includes("Aspirin")) {
            const flask = existingPositions.find(
              (pos) => pos.id === "erlenmeyer_flask",
            );
            const waterBath = existingPositions.find(
              (pos) => pos.id === "water_bath",
            );

            switch (equipmentId) {
              case "water_bath":
                // Position in center-bottom area
                return {
                  x: Math.max(200, Math.min(dropX, window.innerWidth - 200)),
                  y: Math.max(300, dropY),
                };

              case "erlenmeyer_flask":
                // If water bath exists, position flask near it
                if (waterBath) {
                  const distanceToWaterBath = Math.sqrt(
                    (dropX - waterBath.x) ** 2 + (dropY - waterBath.y) ** 2,
                  );
                  if (distanceToWaterBath < 100) {
                    setToastMessage(
                      "🔧 Auto-positioned flask for heating setup!",
                    );
                    setTimeout(() => setToastMessage(null), 3000);
                    return { x: waterBath.x + 50, y: waterBath.y - 50 };
                  }
                }
                return { x: dropX, y: dropY };

              default:
                return { x: dropX, y: dropY };
            }
          }

          return { x: dropX, y: dropY };
        };

        if (existing) {
          // Smooth position update for existing equipment with auto-positioning
          console.log(`Repositioning existing equipment: ${id}`);
          const optimalPos = getOptimalPosition(id, validX, validY, prev);
          console.log(
            `New position for ${id}: x=${optimalPos.x}, y=${optimalPos.y}`,
          );
          return prev.map((pos) =>
            pos.id === id ? { ...pos, x: optimalPos.x, y: optimalPos.y } : pos,
          );
        }

        // Check if this completes a guided step for Aspirin Synthesis
        if (
          experimentTitle.includes("Aspirin") &&
          aspirinGuidedSteps &&
          aspirinGuidedSteps.length > 0
        ) {
          // Validate step sequence and show warnings
          validateStepSequence("equipment", id);

          const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
          if (currentStep?.requiredEquipment === id) {
            setCurrentGuidedStep((prev) => prev + 1);
            setToastMessage(`✓ Step ${currentGuidedStep} completed!`);
            setTimeout(() => setToastMessage(null), 3000);
          }
        }

        // Auto-start heating when water bath is placed for heating step
        if (id === "water_bath" && currentGuidedStep === 5) {
          setTimeout(() => {
            setToastMessage("💡 Click on the water bath to start heating!");
            setTimeout(() => setToastMessage(null), 4000);
          }, 1000);
        }

        // Get optimal position for new equipment
        console.log(`Adding new equipment: ${id}`);
        const optimalPos = getOptimalPosition(id, validX, validY, prev);
        console.log(
          `Optimal position for new ${id}: x=${optimalPos.x}, y=${optimalPos.y}`,
        );
        const newEquipment = {
          id,
          x: optimalPos.x,
          y: optimalPos.y,
          chemicals: [],
        };
        console.log(`Equipment list after adding ${id}:`, [
          ...prev,
          newEquipment,
        ]);
        return [...prev, newEquipment];
      });
    },
    [experimentTitle, currentGuidedStep, aspirinGuidedSteps],
  );

  const handleEquipmentRemove = useCallback(
    (id: string) => {
      setEquipmentPositions((prev) => prev.filter((pos) => pos.id !== id));

      // Reset step progress when key equipment is removed for Aspirin experiment
      if (
        experimentTitle.includes("Aspirin") &&
        aspirinGuidedSteps &&
        aspirinGuidedSteps.length > 0
      ) {
        try {
          // Find which step this equipment belongs to
          const stepWithEquipment = aspirinGuidedSteps.find(
            (step) => step.requiredEquipment === id,
          );

          if (stepWithEquipment && currentGuidedStep > stepWithEquipment.id) {
            // Reset to the step where this equipment was required
            setCurrentGuidedStep(stepWithEquipment.id);
            setToastMessage(
              `📝 Progress reset to Step ${stepWithEquipment.id} because ${id} was removed`,
            );
            setTimeout(() => setToastMessage(null), 4000);

            // Also reset heating if water bath is removed
            if (id === "water_bath") {
              setIsHeating(false);
              setHeatingTime(0);
              setTargetTemperature(25);
              setActualTemperature(25);
            }
          } else {
            setToastMessage(`${id} removed from workbench`);
            setTimeout(() => setToastMessage(null), 2000);
          }
        } catch (error) {
          console.warn("Error resetting step progress:", error);
          setToastMessage(`${id} removed from workbench`);
          setTimeout(() => setToastMessage(null), 2000);
        }
      } else {
        setToastMessage(`${id} removed from workbench`);
        setTimeout(() => setToastMessage(null), 2000);
      }
    },
    [experimentTitle, aspirinGuidedSteps, currentGuidedStep],
  );

  const calculateChemicalProperties = (
    chemical: any,
    amount: number,
    totalVolume: number,
  ) => {
    const concentrations: { [key: string]: number } = {
      hcl: 0.1, // 0.1 M HCl
      naoh: 0.1, // 0.1 M NaOH
      phenol: 0, // Indicator (no molarity)
    };

    const molarity = concentrations[chemical.id] || 0;
    const volumeInL = amount / 1000; // Convert mL to L
    const moles = molarity * volumeInL;

    // Calculate pH for acids and bases
    let ph = 7; // neutral
    if (chemical.id === "hcl") {
      ph = -Math.log10(molarity * (amount / totalVolume)); // Acidic
    } else if (chemical.id === "naoh") {
      const poh = -Math.log10(molarity * (amount / totalVolume));
      ph = 14 - poh; // Basic
    }

    return {
      molarity: molarity * (amount / totalVolume),
      moles,
      ph: Math.max(0, Math.min(14, ph)),
    };
  };

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
          if (
            experimentTitle.includes("Aspirin") &&
            aspirinGuidedSteps &&
            aspirinGuidedSteps.length > 0
          ) {
            // Validate step sequence and show warnings
            validateStepSequence("chemical", chemicalId, equipmentId);

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
            handleReaction(newChemicals, totalVolume);

            // Update measurements for experiments 2 and 3
            if (
              experimentTitle.includes("Acid-Base") ||
              experimentTitle.includes("Equilibrium")
            ) {
              // Use the most recent chemical for calculations
              const recentChemical = newChemicals[newChemicals.length - 1];
              const calculations = calculateChemicalProperties(
                recentChemical,
                recentChemical.amount,
                totalVolume,
              );
              setMeasurements((prev) => ({
                ...prev,
                volume: experimentTitle.includes("Acid-Base")
                  ? prev.volume + recentChemical.amount
                  : totalVolume,
                concentration: calculations.molarity,
                ph: calculations.ph,
                molarity: calculations.molarity,
                moles: calculations.moles,
              }));

              // Show measurements panel for titration
              if (experimentTitle.includes("Acid-Base")) {
                setShowMeasurementsPanel(true);
              }
            }
          }

          return { ...pos, chemicals: newChemicals };
        }
        return pos;
      }),
    );

    setSelectedChemical(null);
  };

  const handleReaction = (chemicals: any[], totalVolume: number) => {
    // Simplified reaction detection
    const hasAcid = chemicals.some((c) => c.id === "hcl");
    const hasBase = chemicals.some((c) => c.id === "naoh");
    const hasIndicator = chemicals.some((c) => c.id === "phenol");

    if (hasAcid && hasBase) {
      const result: Result = {
        id: Date.now().toString(),
        type: "reaction",
        title: "Acid-Base Neutralization Detected",
        description: "HCl + NaOH → NaCl + H��O",
        timestamp: new Date().toLocaleTimeString(),
        calculation: {
          reaction: "HCl + NaOH → NaCl + H₂O",
          reactionType: "Acid-Base Neutralization",
          balancedEquation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
          products: ["Sodium Chloride (NaCl)", "Water (H₂O)"],
          yield: 95,
        },
      };

      setResults((prev) => [...prev, result]);
    }
  };

  const handleStartExperiment = () => {
    setIsRunning(true);
    onStepComplete();
  };

  const handleStartHeating = () => {
    if (!isHeating) {
      setIsHeating(true);
      setTargetTemperature(85);
      setHeatingTime(0);
      setToastMessage("🔥 Water bath heating started - Target: 85°C");
      setTimeout(() => setToastMessage(null), 3000);

      // Simulate temperature increase over time
      const heatingInterval = setInterval(() => {
        setActualTemperature((temp) => {
          const newTemp = Math.min(85, temp + 2);
          if (newTemp >= 85) {
            setToastMessage(
              "✓ Target temperature reached! Heat for 15 minutes.",
            );
            setTimeout(() => setToastMessage(null), 4000);
          }
          return newTemp;
        });

        // Update measurements temperature too
        setMeasurements((prev) => ({
          ...prev,
          temperature: Math.min(85, prev.temperature + 2),
        }));
      }, 1000);

      // Track heating time
      const timeInterval = setInterval(() => {
        setHeatingTime((time) => {
          const newTime = time + 1;
          if (newTime >= 15 * 60) {
            // 15 minutes
            clearInterval(heatingInterval);
            clearInterval(timeInterval);
            setIsHeating(false);
            setCurrentGuidedStep((prev) => prev + 1);
            setToastMessage("✅ Heating step completed!");
            setTimeout(() => setToastMessage(null), 3000);
            return 15 * 60;
          }
          return newTime;
        });
      }, 1000);

      // Store intervals for cleanup
      setTimeout(
        () => {
          if (heatingInterval) clearInterval(heatingInterval);
          if (timeInterval) clearInterval(timeInterval);
        },
        16 * 60 * 1000,
      ); // Cleanup after 16 minutes
    }
  };

  const handleStopHeating = () => {
    setIsHeating(false);
    setTargetTemperature(25);
    setActualTemperature(25);
    setHeatingTime(0);
    setMeasurements((prev) => ({
      ...prev,
      temperature: 25,
    }));
    setToastMessage("🔥 Heating stopped");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleSkipMinute = () => {
    if (
      isHeating &&
      actualTemperature >= targetTemperature &&
      heatingTime < 15 * 60
    ) {
      setHeatingTime((prevTime) => {
        const newTime = Math.min(prevTime + 60, 15 * 60); // Add 1 minute, but don't exceed 15 minutes
        if (newTime >= 15 * 60) {
          // If we've reached the end, complete the heating
          setIsHeating(false);
          setCurrentGuidedStep((prev) => prev + 1);
          setToastMessage("✅ Heating step completed!");
          setTimeout(() => setToastMessage(null), 3000);
        } else {
          setToastMessage("⏩ Skipped ahead 1 minute");
          setTimeout(() => setToastMessage(null), 2000);
        }
        return newTime;
      });
    }
  };

  const handleClearResults = () => {
    setResults([]);
  };

  // pH Meter functions for titration
  const handlePhMeterCalibration = () => {
    setPhMeterCalibrated(true);
    setToastMessage("✓ pH Meter calibrated with buffer solutions");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCalculateEndpoint = () => {
    if (experimentTitle.includes("Acid-Base")) {
      const volumeAdded = measurements.volume;
      const percentComplete = Math.min((volumeAdded / 23.5) * 100, 100);

      // Simulate titration curve
      let newPH = 7.0;
      if (volumeAdded < 20) {
        newPH = 2.5 + (volumeAdded / 20) * 4; // Gradual increase
      } else if (volumeAdded >= 20 && volumeAdded < 23.5) {
        newPH = 6.5 + ((volumeAdded - 20) / 3.5) * 4; // Rapid increase near endpoint
      } else {
        newPH = 11.0 + Math.min((volumeAdded - 23.5) * 0.1, 2); // Basic region
      }

      setCurrentPH(newPH);
      setMeasurements((prev) => ({
        ...prev,
        ph: newPH,
        molarity: (0.1 * volumeAdded) / 25.0, // Calculate HCl molarity
      }));

      const result: Result = {
        id: Date.now().toString(),
        type: newPH > 8.2 ? "success" : "warning",
        title: newPH > 8.2 ? "Endpoint Reached!" : "Approaching Endpoint",
        description: `pH: ${newPH.toFixed(2)}, Volume: ${volumeAdded.toFixed(1)}mL`,
        timestamp: new Date().toLocaleTimeString(),
        calculation: {
          ph: newPH,
          volumeAdded: volumeAdded,
          molarity: (0.1 * volumeAdded) / 25.0,
          reactionType: "Acid-Base Neutralization",
        },
      };

      setResults((prev) => [...prev, result]);

      if (newPH > 8.2) {
        setToastMessage("🎉 Titration endpoint reached! Pink color persists.");
      } else {
        setToastMessage(`📊 pH: ${newPH.toFixed(2)} - Continue titration`);
      }
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleResetMeasurements = () => {
    setMeasurements({
      volume: 0,
      concentration: 0,
      ph: 7,
      molarity: 0,
      moles: 0,
      temperature: 25,
    });
    setCurrentPH(7.0);
    setShowMeasurementsPanel(false);
    setToastMessage("🔄 Measurements reset for new trial");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Function to check if an action is valid for the current step
  const validateStepSequence = (
    actionType: "equipment" | "chemical",
    itemId: string,
    targetId?: string,
  ) => {
    try {
      if (
        !experimentTitle.includes("Aspirin") ||
        !aspirinGuidedSteps ||
        aspirinGuidedSteps.length === 0
      )
        return true; // Only validate for Aspirin experiment

      const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
      if (!currentStep) return true; // No more steps

      // Check if this action matches the current step
      if (
        actionType === "equipment" &&
        currentStep.requiredEquipment === itemId
      ) {
        return true; // Correct equipment for current step
      }

      if (
        actionType === "chemical" &&
        currentStep.requiredChemical === itemId &&
        currentStep.targetEquipment === targetId
      ) {
        return true; // Correct chemical for current step
      }

      // Check if this action belongs to a future step
      const futureStep = aspirinGuidedSteps.find(
        (step) =>
          step &&
          step.id > currentGuidedStep &&
          ((actionType === "equipment" && step.requiredEquipment === itemId) ||
            (actionType === "chemical" &&
              step.requiredChemical === itemId &&
              step.targetEquipment === targetId)),
      );

      if (futureStep) {
        // Show warning toast instead of modal to prevent crashes
        setToastMessage(
          `⚠️ You're trying to do Step ${futureStep.id} early. Current step is ${currentGuidedStep}.`,
        );
        setTimeout(() => setToastMessage(null), 4000);
        return true; // Allow the action but show warning
      }

      // Check if this action was already done in a previous step
      const pastStep = aspirinGuidedSteps.find(
        (step) =>
          step &&
          step.id < currentGuidedStep &&
          ((actionType === "equipment" && step.requiredEquipment === itemId) ||
            (actionType === "chemical" &&
              step.requiredChemical === itemId &&
              step.targetEquipment === targetId)),
      );

      if (pastStep) {
        setToastMessage(
          `ℹ️ Step ${pastStep.id} was already completed. Continue with Step ${currentGuidedStep}.`,
        );
        setTimeout(() => setToastMessage(null), 4000);
        return true; // Allow the action but show info
      }

      // Allow unknown actions without warning
      return true;
    } catch (error) {
      console.warn("Error in step validation:", error);
      return true; // Allow action if validation fails to prevent crashes
    }
  };

  const handleRestartExperiment = () => {
    try {
      setShowWrongStepModal(false);
      setCurrentGuidedStep(1);
      setEquipmentPositions([]);
      setIsHeating(false);
      setHeatingTime(0);
      setTargetTemperature(25);
      setActualTemperature(25);
      setResults([]);
      setMeasurements({
        volume: 0,
        concentration: 0,
        ph: 7,
        molarity: 0,

        moles: 0,
        temperature: 25,
      });
      setExperimentCompleted(false);
      setCompletionTime(null);
      setToastMessage("🔄 Experiment restarted");
      setTimeout(() => setToastMessage(null), 2000);
    } catch (error) {
      console.warn("Error restarting experiment:", error);
      // At minimum, close the modal
      setShowWrongStepModal(false);
    }
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

                  {(aspirinGuidedSteps || []).map((step, index) => (
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
                <>
                  <ExperimentSteps
                    currentStep={currentStep}
                    steps={experimentSteps}
                    onStepClick={handleStepClick}
                    experimentTitle={experimentTitle}
                  />

                  {/* Chemical Formulas for Acid-Base Titration */}
                  {experimentTitle.includes("Acid-Base") && (
                    <div className="mt-4">
                      <ChemicalFormulas experimentTitle={experimentTitle} />
                    </div>
                  )}
                </>
              )}

              {/* Heating Status Panel - For Aspirin Experiment */}
              {experimentTitle.includes("Aspirin") &&
                (isHeating || heatingTime > 0) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                        ��� Heating Status
                      </h3>
                      <div className="flex items-center gap-2">
                        {isHeating &&
                          actualTemperature >= targetTemperature &&
                          heatingTime < 15 * 60 && (
                            <button
                              onClick={handleSkipMinute}
                              className="text-xs px-3 py-1 rounded-md font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              ⏩ Skip +1 min
                            </button>
                          )}
                        {isHeating && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-xs text-orange-600 font-medium">
                            Current Temp
                          </div>
                          <div className="text-sm font-bold text-orange-900">
                            {Math.round(actualTemperature)}°C
                          </div>
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                          <div className="text-xs text-red-600 font-medium">
                            Target Temp
                          </div>
                          <div className="text-sm font-bold text-red-900">
                            {targetTemperature}°C
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs text-blue-600 font-medium">
                            Heating Time
                          </div>
                          <div className="text-sm font-bold text-blue-900">
                            {Math.floor(heatingTime / 60)}:
                            {String(heatingTime % 60).padStart(2, "0")}
                          </div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-xs text-green-600 font-medium">
                            Progress
                          </div>
                          <div className="text-sm font-bold text-green-900">
                            {Math.min(
                              100,
                              Math.round((heatingTime / (15 * 60)) * 100),
                            )}
                            %
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (heatingTime / (15 * 60)) * 100)}%`,
                          }}
                        ></div>
                      </div>

                      {/* Status messages */}
                      <div className="bg-gray-50 p-2 rounded border-t border-gray-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">
                          Status
                        </div>
                        <div className="text-xs">
                          {!isHeating && heatingTime === 0 && (
                            <span className="text-gray-600">Ready to heat</span>
                          )}
                          {isHeating &&
                            actualTemperature < targetTemperature && (
                              <span className="text-orange-600">
                                Heating up...
                              </span>
                            )}
                          {isHeating &&
                            actualTemperature >= targetTemperature &&
                            heatingTime < 15 * 60 && (
                              <span className="text-green-600">
                                At target temperature - Continue heating
                              </span>
                            )}
                          {heatingTime >= 15 * 60 && (
                            <span className="text-green-600">
                              ✅ Heating complete!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Concentration Measurement Panel - For Experiments 2 & 3 */}
              {(experimentTitle.includes("Acid-Base") ||
                experimentTitle.includes("Equilibrium")) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                      <FlaskConical className="w-4 h-4 mr-2 text-blue-600" />
                      Live Measurements
                    </h3>
                    {isRunning && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-xs text-blue-600 font-medium">
                          Volume
                        </div>
                        <div className="text-sm font-bold text-blue-900">
                          {measurements.volume.toFixed(1)} mL
                        </div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <div className="text-xs text-purple-600 font-medium">
                          pH
                        </div>
                        <div className="text-sm font-bold text-purple-900">
                          {measurements.ph.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-green-600 font-medium">
                          Molarity
                        </div>
                        <div className="text-sm font-bold text-green-900">
                          {measurements.molarity.toFixed(3)} M
                        </div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-xs text-orange-600 font-medium">
                          Moles
                        </div>
                        <div className="text-sm font-bold text-orange-900">
                          {measurements.moles.toFixed(4)} mol
                        </div>
                      </div>
                    </div>

                    {experimentTitle.includes("Equilibrium") && (
                      <div className="bg-indigo-50 p-2 rounded">
                        <div className="text-xs text-indigo-600 font-medium">
                          Temperature
                        </div>
                        <div className="text-sm font-bold text-indigo-900">
                          {measurements.temperature}°C
                        </div>
                      </div>
                    )}

                    {experimentTitle.includes("Acid-Base") &&
                      measurements.volume > 0 && (
                        <div className="bg-gray-50 p-2 rounded border-t border-gray-200">
                          <div className="text-xs text-gray-600 font-medium mb-1">
                            Titration Status
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600">Endpoint: </span>
                            <span className="font-medium text-gray-900">
                              {measurements.ph > 8.5
                                ? "Reached"
                                : "Not reached"}
                            </span>
                          </div>
                        </div>
                      )}

                    {experimentTitle.includes("Equilibrium") && (
                      <div className="bg-gray-50 p-2 rounded border-t border-gray-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">
                          Equilibrium
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-600">Color: </span>
                          <span className="font-medium text-gray-900">
                            {measurements.ph < 7
                              ? "Blue (acidic)"
                              : "Pink (basic)"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
                    {aspirinGuidedSteps?.length || 0}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentGuidedStep - 1) / (aspirinGuidedSteps?.length || 1)) * 100}%`,
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
                  // Complete reset of all experiment states
                  setEquipmentPositions([]);
                  setResults([]);
                  setIsRunning(false);
                  setCurrentStep(1);
                  setCurrentGuidedStep(1);
                  setSelectedChemical(null);
                  setExperimentCompleted(false);
                  setCompletionTime(null);
                  setShowCompletionModal(false);
                  setShowWrongStepModal(false);
                  setIsHeating(false);
                  setHeatingTime(0);
                  setTargetTemperature(25);
                  setActualTemperature(25);
                  setMeasurements({
                    volume: 0,
                    concentration: 0,
                    ph: 7,
                    molarity: 0,
                    moles: 0,
                    temperature: 25,
                  });
                  setToastMessage("🔄 Experiment reset successfully");
                  setTimeout(() => setToastMessage(null), 2000);
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

          {/* Chemicals Bar */}
          <div className="bg-gray-50 border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 text-sm flex items-center">
                <Beaker className="w-4 h-4 mr-2 text-green-600" />
                Available Chemicals
              </h4>
            </div>
            <div className="flex items-center space-x-3 mt-2 overflow-x-auto pb-2">
              {experimentChemicals.map((chemical) => (
                <div key={chemical.id} className="flex-shrink-0">
                  <Chemical
                    id={chemical.id}
                    name={chemical.name}
                    formula={chemical.formula}
                    color={chemical.color}
                    concentration={chemical.concentration}
                    volume={chemical.volume}
                    selected={selectedChemical === chemical.id}
                    onSelect={() => setSelectedChemical(chemical.id)}
                  />
                </div>
              ))}
            </div>
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
                    isHeating={
                      isHeating &&
                      (pos.id === "water_bath" || pos.id === "erlenmeyer_flask")
                    }
                    actualTemperature={actualTemperature}
                    targetTemperature={targetTemperature}
                    heatingTime={heatingTime}
                    onStartHeating={handleStartHeating}
                    onStopHeating={handleStopHeating}
                    onRemove={handleEquipmentRemove}
                  />
                ) : null;
              })}
            </WorkBench>
          </div>

          {/* Titration-specific panels */}
          {experimentTitle.includes("Acid-Base") && (
            <div className="border-t border-gray-200 bg-white/90 backdrop-blur-sm">
              <MeasurementsPanel
                measurements={{
                  ph: currentPH,
                  volume: measurements.volume,
                  molarity: measurements.molarity,
                  temperature: measurements.temperature,
                }}
                onCalculateEndpoint={handleCalculateEndpoint}
                onReset={handleResetMeasurements}
                isVisible={measurements.volume > 0 || showMeasurementsPanel}
              />
            </div>
          )}

          {/* pH Meter for titrations */}
          {experimentTitle.includes("Acid-Base") && measurements.volume > 0 && (
            <div className="fixed bottom-4 right-4 z-40">
              <PHMeterSimulation
                currentPH={currentPH}
                isCalibrated={phMeterCalibrated}
                onCalibrate={handlePhMeterCalibration}
                isConnected={true}
                solutionName={"HCl + NaOH Titration"}
                temperature={measurements.temperature}
                onMeasurement={(ph, accuracy) => {
                  setCurrentPH(ph);
                  setMeasurements((prev) => ({ ...prev, ph }));
                }}
              />
            </div>
          )}

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

        {/* Calculator and pH Meter Bar - For Experiments 2 & 3 */}
        {(experimentTitle.includes("Acid-Base") ||
          experimentTitle.includes("Equilibrium")) && (
          <div className="bg-gray-900 text-white p-3 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* pH Meter Section */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">pH Meter</span>
                  </div>
                  <div className="bg-black px-3 py-1 rounded font-mono text-lg">
                    {measurements.ph.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {measurements.ph < 7
                      ? "Acidic"
                      : measurements.ph > 7
                        ? "Basic"
                        : "Neutral"}
                  </div>
                </div>

                {/* Volume Tracker */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">Volume</span>
                  <div className="bg-black px-3 py-1 rounded font-mono text-lg">
                    {measurements.volume.toFixed(1)} mL
                  </div>
                </div>

                {/* Molarity Calculator */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">Molarity</span>
                  <div className="bg-black px-3 py-1 rounded font-mono text-lg">
                    {measurements.molarity.toFixed(3)} M
                  </div>
                </div>
              </div>

              {/* Calculator Actions */}
              <div className="flex items-center space-x-3">
                {experimentTitle.includes("Acid-Base") && (
                  <button
                    onClick={handleCalculateEndpoint}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Calculate Endpoint
                  </button>
                )}

                {experimentTitle.includes("Equilibrium") && (
                  <button
                    onClick={() => {
                      const kc = Math.pow(10, -measurements.ph); // Simplified equilibrium constant
                      console.log(
                        `Equilibrium constant: ${kc.toExponential(2)}`,
                      );
                    }}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Calculate Kc
                  </button>
                )}

                <button
                  onClick={handleResetMeasurements}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Additional calculation info */}
            {measurements.volume > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center space-x-4">
                    <span>Moles: {measurements.moles.toFixed(4)} mol</span>
                    {experimentTitle.includes("Acid-Base") && (
                      <span>
                        Endpoint:{" "}
                        {measurements.ph > 8.5 ? "✓ Reached" : "○ Not reached"}
                      </span>
                    )}
                    {experimentTitle.includes("Equilibrium") && (
                      <span>Temperature: {measurements.temperature}°C</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wrong Step Modal */}
      {showWrongStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Wrong Step!
              </h3>
              <p className="text-gray-600 mb-6">
                {wrongStepMessage ||
                  "Please follow the experiment steps in order."}
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowWrongStepModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Anyway
                </button>
                <button
                  onClick={handleRestartExperiment}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Restart Experiment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Experiment Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Experiment Completed!
              </h3>
              <p className="text-gray-600 mb-4">
                Congratulations! You have successfully completed the{" "}
                {experimentTitle} experiment.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion Time:</span>
                  <span className="font-medium">
                    {completionTime?.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                {experimentTitle.includes("Aspirin") && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Guided Steps:</span>
                    <span className="font-medium">
                      {aspirinGuidedSteps?.length || 0}/
                      {aspirinGuidedSteps?.length || 0}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    // Trigger confetti or celebration animation
                    setToastMessage(
                      "�� Experiment completed! Check your progress.",
                    );
                    setTimeout(() => setToastMessage(null), 4000);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  View Results
                </button>

                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    // Reset experiment for another attempt
                    setEquipmentPositions([]);
                    setResults([]);
                    setIsRunning(false);
                    setCurrentStep(1);
                    setCurrentGuidedStep(1);
                    setExperimentCompleted(false);
                    setCompletionTime(null);
                    setIsHeating(false);
                    setHeatingTime(0);
                    setActualTemperature(25);
                    setShowWrongStepModal(false);
                    setMeasurements({
                      volume: 0,
                      concentration: 0,
                      ph: 7,
                      molarity: 0,
                      moles: 0,
                      temperature: 25,
                    });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualLabApp;
