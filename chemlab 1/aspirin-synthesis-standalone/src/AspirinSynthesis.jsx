import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  FlaskConical,
  Thermometer,
  CheckCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  List,
  Atom,
  BookOpen,
} from "lucide-react";

// Equipment Component
const Equipment = ({
  id,
  name,
  icon,
  onDrag,
  position,
  chemicals = [],
  onChemicalDrop,
  onRemove,
  isHeating = false,
  actualTemperature = 25,
  targetTemperature = 25,
  heatingTime = 0,
  onStartHeating,
  onStopHeating,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("equipment", id);
    setIsDragging(true);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
  };

  const handleChemicalDragOver = (e) => {
    const hasChemical = e.dataTransfer.types.includes("chemical");
    if (!hasChemical || isDragging) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleChemicalDragLeave = (e) => {
    e.preventDefault();
    setTimeout(() => setIsDragOver(false), 50);
  };

  const handleChemicalDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const chemicalData = e.dataTransfer.getData("chemical");
    if (chemicalData && onChemicalDrop && !isDragging) {
      setIsDropping(true);
      const chemical = JSON.parse(chemicalData);
      onChemicalDrop(chemical.id, id, chemical.volume || 25);
      setTimeout(() => setIsDropping(false), 1500);
    }
  };

  const isOnWorkbench = position && (position.x !== 0 || position.y !== 0);
  const isContainer = ["erlenmeyer_flask", "water_bath"].includes(id);

  const getMixedColor = () => {
    if (chemicals.length === 0) return "transparent";
    if (chemicals.length === 1) return chemicals[0].color;

    // Simple color mixing for aspirin synthesis
    if (
      chemicals.some((c) => c.id === "salicylic_acid") &&
      chemicals.some((c) => c.id === "acetic_anhydride")
    ) {
      return "#F5F5DC"; // Beige for aspirin formation
    }

    let r = 0,
      g = 0,
      b = 0,
      totalAmount = 0;
    chemicals.forEach((chemical) => {
      const color = chemical.color;
      const amount = chemical.amount;
      const hex = color.replace("#", "");
      const rVal = parseInt(hex.substr(0, 2), 16);
      const gVal = parseInt(hex.substr(2, 2), 16);
      const bVal = parseInt(hex.substr(4, 2), 16);
      r += rVal * amount;
      g += gVal * amount;
      b += bVal * amount;
      totalAmount += amount;
    });

    if (totalAmount === 0) return "transparent";
    r = Math.round(r / totalAmount);
    g = Math.round(g / totalAmount);
    b = Math.round(b / totalAmount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getSolutionHeight = () => {
    const totalVolume = chemicals.reduce(
      (sum, chemical) => sum + chemical.amount,
      0,
    );
    return Math.min(85, (totalVolume / 100) * 85);
  };

  const renderEquipment = () => {
    if (id === "erlenmeyer_flask" && isOnWorkbench) {
      const isBeingHeated = isHeating && actualTemperature > 30;

      return (
        <div className="relative">
          <div className="relative w-24 h-32">
            <div
              className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${isBeingHeated ? "filter brightness-110 saturate-110" : ""}`}
            >
              {/* Flask body */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-full border-2 border-gray-300 shadow-lg overflow-hidden">
                {/* Glass reflection */}
                <div className="absolute top-2 left-2 w-3 h-6 bg-gradient-to-br from-white to-transparent opacity-60 rounded-full transform rotate-12"></div>

                {/* Solution */}
                {chemicals.length > 0 && (
                  <div
                    className="absolute bottom-1 left-1 right-1 rounded-b-full transition-all duration-700 ease-out"
                    style={{
                      backgroundColor: getMixedColor(),
                      height: `${Math.min(70, getSolutionHeight() * 0.8)}px`,
                      opacity: 0.9,
                      boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 rounded-full"></div>

                    {/* Bubbling animation */}
                    {(chemicals.length > 1 || isBeingHeated) && (
                      <div className="absolute inset-0">
                        {[...Array(isBeingHeated ? 12 : 6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                            style={{
                              left: `${15 + (i % 4) * 15}%`,
                              bottom: `${10 + (i % 3) * 15}px`,
                              animation: `bounce ${isBeingHeated ? "1s" : "1.5s"} infinite ${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Heating glow */}
                {isBeingHeated && (
                  <div className="absolute inset-0 rounded-full bg-orange-300 opacity-20 animate-pulse"></div>
                )}
              </div>

              {/* Flask neck */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-6 h-10 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-300 rounded-t-lg shadow-sm">
                <div className="absolute top-1 left-1 w-1 h-6 bg-white opacity-50 rounded-full"></div>

                {/* Steam when heating */}
                {isBeingHeated && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-px h-8 bg-white opacity-40"
                        style={{
                          left: `${-2 + i * 2}px`,
                          animation: `pulse 2s infinite ${i * 0.3}s`,
                          transform: `rotate(${-5 + i * 5}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Flask opening */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-8 h-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full border border-gray-400"></div>
            </div>

            {/* Temperature indicator */}
            {isBeingHeated && (
              <div className="absolute left-0 top-8 w-3 h-12 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-500 rounded-full"
                  style={{
                    height: `${Math.min(100, ((actualTemperature - 25) / 60) * 100)}%`,
                  }}
                ></div>
                <div className="absolute -left-8 top-0 text-xs text-gray-600 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>
            )}
          </div>

          {/* Chemical composition display */}
          {chemicals.length > 0 && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg">
              <div className="text-gray-800 font-medium text-center">
                {chemicals.map((c) => c.name.split(" ")[0]).join(" + ")}
              </div>
              <div className="text-gray-600 text-center">
                {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(1)} mL
                total
              </div>
              {isBeingHeated && (
                <div className="text-orange-600 text-center font-medium">
                  🔥 Heating: {Math.round(actualTemperature)}°C
                </div>
              )}
              <div
                className="w-full h-2 rounded-full mt-1"
                style={{ backgroundColor: getMixedColor() }}
              ></div>
            </div>
          )}
        </div>
      );
    }

    if (id === "water_bath" && isOnWorkbench) {
      return (
        <div className="relative">
          <div
            className={`cursor-pointer transition-all duration-300 ${isHeating ? "scale-105" : ""}`}
            onClick={isHeating ? onStopHeating : onStartHeating}
          >
            <div className="relative w-32 h-24 bg-gradient-to-b from-gray-300 to-gray-600 rounded-lg shadow-lg overflow-hidden">
              <div
                className={`absolute inset-2 rounded-md transition-all duration-500 ${isHeating ? "bg-gradient-to-b from-orange-200 to-orange-400" : "bg-gradient-to-b from-blue-100 to-blue-300"}`}
              >
                <div
                  className={`absolute top-1 left-1 right-1 h-3 rounded-t-md transition-colors duration-500 ${isHeating ? "bg-orange-300" : "bg-blue-200"}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>

                {/* Bubbles when heating */}
                {isHeating && (
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                        style={{
                          left: `${20 + (i % 4) * 20}%`,
                          top: `${40 + Math.floor(i / 4) * 20}%`,
                          animation: `bounce 1s infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Control panel */}
              <div className="absolute top-1 right-1 bg-black rounded px-1 py-0.5">
                <div className="text-xs text-green-400 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>

              {/* Heating indicator */}
              <div
                className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${isHeating ? "bg-red-500 animate-pulse" : "bg-gray-400"}`}
              ></div>

              {/* Steam effect */}
              {isHeating && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-6 bg-white opacity-40 rounded-full"
                      style={{
                        left: `${-4 + i * 4}px`,
                        animation: `pulse 2s infinite ${i * 0.3}s`,
                        transform: `rotate(${-10 + i * 10}deg)`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isHeating ? onStopHeating?.() : onStartHeating?.();
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      isHeating
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isHeating ? "Stop" : "Heat"}
                  </button>
                  <div className="text-xs text-gray-600">
                    Target: {targetTemperature}°C
                  </div>
                  {isHeating && (
                    <div className="text-xs text-blue-600">
                      {Math.floor(heatingTime / 60)}:
                      {String(heatingTime % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default equipment rendering
    return (
      <div className="mb-3 transition-all duration-200 relative text-blue-600">
        {icon}
      </div>
    );
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={isContainer ? handleChemicalDragOver : undefined}
        onDragLeave={isContainer ? handleChemicalDragLeave : undefined}
        onDrop={isContainer ? handleChemicalDrop : undefined}
        onDoubleClick={() => isOnWorkbench && onRemove?.(id)}
        className={`${
          isOnWorkbench
            ? "cursor-grab active:cursor-grabbing relative"
            : "flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border-2 border-gray-200 hover:border-blue-400 relative"
        } ${
          isContainer && isDragOver && isOnWorkbench && !isDragging
            ? "scale-105"
            : ""
        } ${
          isDropping && isOnWorkbench && !isDragging ? "animate-pulse" : ""
        } ${isDragging ? "opacity-80 transition-none" : ""}`}
        style={{
          position: isOnWorkbench ? "absolute" : "relative",
          left: isOnWorkbench && position ? position.x : "auto",
          top: isOnWorkbench && position ? position.y : "auto",
          zIndex: isOnWorkbench ? 10 : "auto",
          transform: isOnWorkbench ? "translate(-50%, -50%)" : "none",
        }}
        title={isOnWorkbench ? "Double-click to remove" : "Drag to workbench"}
      >
        {/* Drop zone indicator */}
        {isContainer && isOnWorkbench && isDragOver && !isDragging && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full opacity-70 animate-pulse"></div>
        )}

        {renderEquipment()}

        {/* Equipment name in sidebar only */}
        {!isOnWorkbench && (
          <span className="text-sm font-semibold text-center text-gray-700">
            {name}
          </span>
        )}

        {/* Remove button */}
        {isOnWorkbench && (
          <button
            onClick={() => onRemove?.(id)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-colors flex items-center justify-center shadow-md"
            title="Remove from workbench"
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};

// Chemical Component
const Chemical = ({
  id,
  name,
  formula,
  color,
  onSelect,
  selected,
  concentration,
  volume,
}) => {
  const [dragAmount, setDragAmount] = useState(volume || 25);

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "chemical",
      JSON.stringify({
        id,
        name,
        formula,
        color,
        concentration,
        volume: dragAmount,
      }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(id)}
      className={`p-4 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-300 ease-out border-2 transform hover:scale-102 ${
        selected
          ? "border-purple-500 bg-purple-50 shadow-lg scale-102 ring-2 ring-purple-300 ring-opacity-50"
          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md transition-all duration-300 ease-out overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <div
              className="absolute inset-1 rounded-full opacity-50 transition-all duration-500"
              style={{
                backgroundColor: color,
                animation: selected ? "pulse 2s ease-in-out infinite" : "none",
              }}
            ></div>
            <div className="absolute top-1 left-1 w-2 h-2 bg-white opacity-40 rounded-full transition-opacity duration-300"></div>
          </div>

          {selected && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 flex items-center justify-center transition-all duration-300 ease-out animate-bounce shadow-sm">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: color }}
              ></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div
            className={`font-semibold text-lg ${selected ? "text-purple-900" : "text-gray-900"}`}
          >
            {name}
          </div>
          <div
            className={`text-sm font-mono ${selected ? "text-purple-700" : "text-gray-500"}`}
          >
            {formula}
          </div>
          {concentration && (
            <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
              {concentration}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              SELECTED
            </div>
          </div>
        )}
      </div>

      {/* Volume indicator */}
      {volume && (
        <div className="mt-3 bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="h-full transition-all duration-700 ease-out rounded-full relative"
            style={{
              width: `${Math.min(100, (volume / 100) * 100)}%`,
              backgroundColor: color,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Volume Control */}
      {selected && (
        <div className="mt-3 bg-gray-50 rounded-lg p-2">
          <label className="text-xs text-gray-600 font-medium block mb-1">
            Amount (mL)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={dragAmount}
            onChange={(e) => setDragAmount(Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Drag instruction */}
      <div
        className={`text-xs text-center mt-2 transition-all ${selected ? "opacity-100 animate-pulse" : "opacity-0"}`}
      >
        <div className="flex items-center justify-center space-x-1">
          <span className="text-purple-600 font-medium">Drag to equipment</span>
          <span className="text-purple-500 animate-bounce">→</span>
        </div>
      </div>
    </div>
  );
};

// WorkBench Component
const WorkBench = ({
  onDrop,
  children,
  experimentTitle,
  currentGuidedStep = 1,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const equipmentId = e.dataTransfer.getData("equipment");
    const id = equipmentId || e.dataTransfer.getData("text/plain");

    if (id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onDrop(id, x, y);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <div className="bg-white rounded-lg shadow-lg border h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FlaskConical className="mr-3" size={28} />
                <div>
                  <h2 className="text-2xl font-bold">Aspirin Synthesis Lab</h2>
                  <p className="text-sm opacity-90">
                    Interactive Virtual Chemistry
                  </p>
                </div>
              </div>
              <div className="text-xs text-white/80">{experimentTitle}</div>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full overflow-hidden"
            style={{
              height: "calc(75vh - 160px)",
              minHeight: "500px",
              backgroundImage: `
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "25px 25px",
            }}
          >
            {/* Lab Bench Surface */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-200 via-amber-150 to-amber-100 border-t-2 border-amber-300">
              <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-amber-300 to-amber-200"></div>
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 3px,
                  rgba(0,0,0,0.1) 3px,
                  rgba(0,0,0,0.1) 6px
                )`,
                }}
              ></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 opacity-60"></div>
            </div>

            {/* Helpful hints */}
            <div className="absolute top-6 left-6 bg-blue-100 border-2 border-blue-300 rounded-lg p-4 max-w-sm z-20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-blue-800 text-sm">
                  Step {currentGuidedStep}
                </span>
              </div>
              <div className="text-xs text-blue-700">
                {currentGuidedStep === 1 &&
                  "Drag the Erlenmeyer Flask to the workbench to begin"}
                {currentGuidedStep === 2 && "Add Salicylic Acid to the flask"}
                {currentGuidedStep === 3 && "Add Acetic Anhydride to the flask"}
                {currentGuidedStep === 4 && "Add Phosphoric Acid catalyst"}
                {currentGuidedStep === 5 && "Set up the Water Bath for heating"}
                {currentGuidedStep === 6 && "Heat the reaction mixture"}
                {currentGuidedStep > 6 && "Aspirin synthesis steps completed!"}
              </div>
            </div>

            {/* Equipment placement area */}
            <div className="absolute inset-0 p-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Aspirin Synthesis Component
const AspirinSynthesis = () => {
  const [equipmentPositions, setEquipmentPositions] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [showSteps, setShowSteps] = useState(true);
  const [currentGuidedStep, setCurrentGuidedStep] = useState(1);
  const [isHeating, setIsHeating] = useState(false);
  const [heatingTime, setHeatingTime] = useState(0);
  const [targetTemperature, setTargetTemperature] = useState(25);
  const [actualTemperature, setActualTemperature] = useState(25);
  const [toastMessage, setToastMessage] = useState(null);
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Aspirin synthesis chemicals
  const experimentChemicals = [
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

  // Aspirin synthesis equipment
  const experimentEquipment = [
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
      icon: <Thermometer size={36} className="text-red-600" />,
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
        </svg>
      ),
    },
  ];

  // Guided steps for Aspirin Synthesis
  const aspirinGuidedSteps = [
    {
      id: 1,
      title: "Set up Erlenmeyer Flask",
      instruction: "Drag the 125mL Erlenmeyer Flask to the workbench",
      requiredEquipment: "erlenmeyer_flask",
    },
    {
      id: 2,
      title: "Add Salicylic Acid",
      instruction: "Drag 2.0g of Salicylic Acid into the Erlenmeyer Flask",
      requiredChemical: "salicylic_acid",
      targetEquipment: "erlenmeyer_flask",
    },
    {
      id: 3,
      title: "Add Acetic Anhydride",
      instruction:
        "Add 5mL of Acetic Anhydride to the flask using the graduated cylinder",
      requiredChemical: "acetic_anhydride",
      targetEquipment: "erlenmeyer_flask",
    },
    {
      id: 4,
      title: "Add Catalyst",
      instruction: "Add 2-3 drops of Phosphoric Acid as catalyst",
      requiredChemical: "phosphoric_acid",
      targetEquipment: "erlenmeyer_flask",
    },
    {
      id: 5,
      title: "Set up Water Bath",
      instruction: "Drag the Water Bath to the workbench and heat to 85°C",
      requiredEquipment: "water_bath",
    },
    {
      id: 6,
      title: "Heat Reaction",
      instruction:
        "Place the flask in the water bath and heat for 15 minutes at 85°C",
      requiresHeating: true,
      targetTemp: 85,
      duration: 15,
    },
  ];

  const handleEquipmentDrop = useCallback(
    (id, x, y) => {
      const validX = Math.max(50, Math.min(x, window.innerWidth - 200));
      const validY = Math.max(50, Math.min(y, window.innerHeight - 200));

      setEquipmentPositions((prev) => {
        const existing = prev.find((pos) => pos.id === id);
        if (existing) {
          return prev.map((pos) =>
            pos.id === id ? { ...pos, x: validX, y: validY } : pos,
          );
        }

        // Check if this completes a guided step
        const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
        if (currentStep?.requiredEquipment === id) {
          setCurrentGuidedStep((prev) => prev + 1);
          setToastMessage(`✓ Step ${currentGuidedStep} completed!`);
          setTimeout(() => setToastMessage(null), 3000);
        }

        // Auto-start heating when water bath is placed for heating step
        if (id === "water_bath" && currentGuidedStep === 5) {
          setTimeout(() => {
            setToastMessage("💡 Click on the water bath to start heating!");
            setTimeout(() => setToastMessage(null), 4000);
          }, 1000);
        }

        return [...prev, { id, x: validX, y: validY, chemicals: [] }];
      });
    },
    [currentGuidedStep],
  );

  const handleEquipmentRemove = useCallback(
    (id) => {
      setEquipmentPositions((prev) => prev.filter((pos) => pos.id !== id));

      // Reset step progress when key equipment is removed
      const stepWithEquipment = aspirinGuidedSteps.find(
        (step) => step.requiredEquipment === id,
      );

      if (stepWithEquipment && currentGuidedStep > stepWithEquipment.id) {
        setCurrentGuidedStep(stepWithEquipment.id);
        setToastMessage(
          `📝 Progress reset to Step ${stepWithEquipment.id} because ${id} was removed`,
        );
        setTimeout(() => setToastMessage(null), 4000);

        if (id === "water_bath") {
          setIsHeating(false);
          setHeatingTime(0);
          setTargetTemperature(25);
          setActualTemperature(25);
        }
      }
    },
    [currentGuidedStep],
  );

  const handleChemicalSelect = (id) => {
    setSelectedChemical(selectedChemical === id ? null : id);
  };

  const handleChemicalDrop = (chemicalId, equipmentId, amount) => {
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

          setToastMessage(
            `Added ${amount}mL of ${chemical.name} to ${equipmentId}`,
          );
          setTimeout(() => setToastMessage(null), 3000);

          // Check if this completes a guided step
          const currentStep = aspirinGuidedSteps[currentGuidedStep - 1];
          if (
            currentStep?.requiredChemical === chemicalId &&
            currentStep?.targetEquipment === equipmentId
          ) {
            setCurrentGuidedStep((prev) => prev + 1);
            setToastMessage(`✓ Step ${currentGuidedStep} completed!`);
            setTimeout(() => setToastMessage(null), 3000);
          }

          return { ...pos, chemicals: newChemicals };
        }
        return pos;
      }),
    );

    setSelectedChemical(null);
  };

  const handleStartHeating = () => {
    if (!isHeating) {
      setIsHeating(true);
      setTargetTemperature(85);
      setHeatingTime(0);
      setToastMessage("🔥 Water bath heating started - Target: 85°C");
      setTimeout(() => setToastMessage(null), 3000);

      // Simulate temperature increase
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
      }, 1000);

      // Track heating time
      const timeInterval = setInterval(() => {
        setHeatingTime((time) => {
          const newTime = time + 1;
          if (newTime >= 15 * 60) {
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
    }
  };

  const handleStopHeating = () => {
    setIsHeating(false);
    setTargetTemperature(25);
    setActualTemperature(25);
    setHeatingTime(0);
    setToastMessage("🔥 Heating stopped");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Check for experiment completion
  useEffect(() => {
    const allStepsCompleted = currentGuidedStep > aspirinGuidedSteps.length;
    const heatingCompleted = heatingTime >= 15 * 60;
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
      setShowCompletionModal(true);
    }
  }, [currentGuidedStep, heatingTime, equipmentPositions, experimentCompleted]);

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
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg">
                  <h3 className="font-bold text-sm">Step-by-Step Guide</h3>
                  <p className="text-xs opacity-90">
                    Follow instructions to synthesize aspirin
                  </p>
                </div>

                {aspirinGuidedSteps.map((step) => (
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

              {/* Heating Status Panel */}
              {(isHeating || heatingTime > 0) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                      🔥 Heating Status
                    </h3>
                    {isHeating && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
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
        {/* Equipment Bar */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center">
              <Atom className="w-4 h-4 mr-2 text-blue-600" />
              Aspirin Synthesis - Equipment
            </h4>
            <div className="text-xs text-gray-600 mr-3 flex items-center space-x-2">
              <span>
                Progress: {currentGuidedStep - 1}/{aspirinGuidedSteps.length}
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

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 relative">
            <WorkBench
              onDrop={handleEquipmentDrop}
              selectedChemical={selectedChemical}
              experimentTitle="Aspirin Synthesis"
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
        </div>

        {/* Reagents Bar */}
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
                Congratulations! You have successfully completed the Aspirin
                Synthesis experiment.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Guided Steps:</span>
                  <span className="font-medium">
                    {aspirinGuidedSteps.length}/{aspirinGuidedSteps.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  View Results
                </button>

                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    // Reset experiment
                    setEquipmentPositions([]);
                    setCurrentGuidedStep(1);
                    setExperimentCompleted(false);
                    setIsHeating(false);
                    setHeatingTime(0);
                    setActualTemperature(25);
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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default AspirinSynthesis;
