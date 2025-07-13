import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Atom,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Eye,
  EyeOff,
  Download,
  Palette,
} from "lucide-react";

interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
  z?: number;
  color: string;
  radius: number;
  charge?: number;
}

interface Bond {
  id: string;
  atom1: string;
  atom2: string;
  type: "single" | "double" | "triple" | "aromatic";
  color: string;
}

interface Molecule {
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: Bond[];
  description?: string;
}

interface MolecularVisualizationProps {
  molecule?: Molecule;
  showAnimation?: boolean;
  showElectronDensity?: boolean;
  width?: number;
  height?: number;
  onMoleculeChange?: (molecule: Molecule) => void;
}

const defaultMolecules: { [key: string]: Molecule } = {
  water: {
    name: "Water",
    formula: "H₂O",
    description: "Essential solvent for biological processes",
    atoms: [
      {
        id: "O1",
        element: "O",
        x: 150,
        y: 100,
        color: "#ff4444",
        radius: 20,
        charge: -0.68,
      },
      {
        id: "H1",
        element: "H",
        x: 120,
        y: 130,
        color: "#ffffff",
        radius: 10,
        charge: 0.34,
      },
      {
        id: "H2",
        element: "H",
        x: 180,
        y: 130,
        color: "#ffffff",
        radius: 10,
        charge: 0.34,
      },
    ],
    bonds: [
      { id: "b1", atom1: "O1", atom2: "H1", type: "single", color: "#888888" },
      { id: "b2", atom1: "O1", atom2: "H2", type: "single", color: "#888888" },
    ],
  },
  aspirin: {
    name: "Aspirin",
    formula: "C₉H₈O₄",
    description: "Acetylsalicylic acid - pain reliever and anti-inflammatory",
    atoms: [
      // Benzene ring
      { id: "C1", element: "C", x: 150, y: 100, color: "#444444", radius: 15 },
      { id: "C2", element: "C", x: 180, y: 85, color: "#444444", radius: 15 },
      { id: "C3", element: "C", x: 210, y: 100, color: "#444444", radius: 15 },
      { id: "C4", element: "C", x: 210, y: 130, color: "#444444", radius: 15 },
      { id: "C5", element: "C", x: 180, y: 145, color: "#444444", radius: 15 },
      { id: "C6", element: "C", x: 150, y: 130, color: "#444444", radius: 15 },
      // Carboxyl group
      { id: "C7", element: "C", x: 240, y: 100, color: "#444444", radius: 15 },
      { id: "O1", element: "O", x: 260, y: 85, color: "#ff4444", radius: 18 },
      { id: "O2", element: "O", x: 250, y: 125, color: "#ff4444", radius: 18 },
      { id: "H1", element: "H", x: 275, y: 125, color: "#ffffff", radius: 8 },
      // Acetyl group
      { id: "O3", element: "O", x: 120, y: 130, color: "#ff4444", radius: 18 },
      { id: "C8", element: "C", x: 95, y: 120, color: "#444444", radius: 15 },
      { id: "O4", element: "O", x: 85, y: 100, color: "#ff4444", radius: 18 },
      { id: "C9", element: "C", x: 75, y: 135, color: "#444444", radius: 15 },
    ],
    bonds: [
      // Benzene ring bonds
      {
        id: "b1",
        atom1: "C1",
        atom2: "C2",
        type: "aromatic",
        color: "#666666",
      },
      {
        id: "b2",
        atom1: "C2",
        atom2: "C3",
        type: "aromatic",
        color: "#666666",
      },
      {
        id: "b3",
        atom1: "C3",
        atom2: "C4",
        type: "aromatic",
        color: "#666666",
      },
      {
        id: "b4",
        atom1: "C4",
        atom2: "C5",
        type: "aromatic",
        color: "#666666",
      },
      {
        id: "b5",
        atom1: "C5",
        atom2: "C6",
        type: "aromatic",
        color: "#666666",
      },
      {
        id: "b6",
        atom1: "C6",
        atom2: "C1",
        type: "aromatic",
        color: "#666666",
      },
      // Functional groups
      { id: "b7", atom1: "C3", atom2: "C7", type: "single", color: "#888888" },
      { id: "b8", atom1: "C7", atom2: "O1", type: "double", color: "#888888" },
      { id: "b9", atom1: "C7", atom2: "O2", type: "single", color: "#888888" },
      { id: "b10", atom1: "O2", atom2: "H1", type: "single", color: "#888888" },
      { id: "b11", atom1: "C6", atom2: "O3", type: "single", color: "#888888" },
      { id: "b12", atom1: "O3", atom2: "C8", type: "single", color: "#888888" },
      { id: "b13", atom1: "C8", atom2: "O4", type: "double", color: "#888888" },
      { id: "b14", atom1: "C8", atom2: "C9", type: "single", color: "#888888" },
    ],
  },
  hcl: {
    name: "Hydrochloric Acid",
    formula: "HCl",
    description: "Strong acid that completely ionizes in water",
    atoms: [
      {
        id: "H1",
        element: "H",
        x: 120,
        y: 100,
        color: "#ffffff",
        radius: 12,
        charge: 0.18,
      },
      {
        id: "Cl1",
        element: "Cl",
        x: 180,
        y: 100,
        color: "#44ff44",
        radius: 22,
        charge: -0.18,
      },
    ],
    bonds: [
      { id: "b1", atom1: "H1", atom2: "Cl1", type: "single", color: "#888888" },
    ],
  },
  naoh: {
    name: "Sodium Hydroxide",
    formula: "NaOH",
    description: "Strong base that dissociates completely in water",
    atoms: [
      {
        id: "Na1",
        element: "Na",
        x: 120,
        y: 100,
        color: "#ff8800",
        radius: 25,
        charge: 1.0,
      },
      {
        id: "O1",
        element: "O",
        x: 170,
        y: 100,
        color: "#ff4444",
        radius: 18,
        charge: -0.68,
      },
      {
        id: "H1",
        element: "H",
        x: 200,
        y: 100,
        color: "#ffffff",
        radius: 10,
        charge: -0.32,
      },
    ],
    bonds: [
      { id: "b1", atom1: "Na1", atom2: "O1", type: "single", color: "#888888" },
      { id: "b2", atom1: "O1", atom2: "H1", type: "single", color: "#888888" },
    ],
  },
  phenolphthalein: {
    name: "Phenolphthalein",
    formula: "C₂₀H₁₄O₄",
    description:
      "pH indicator that changes from colorless to pink in basic solutions",
    atoms: [
      // Central carbon framework
      { id: "C1", element: "C", x: 150, y: 120, color: "#444444", radius: 15 },
      { id: "C2", element: "C", x: 180, y: 100, color: "#444444", radius: 15 },
      { id: "C3", element: "C", x: 200, y: 130, color: "#444444", radius: 15 },
      // Phenyl rings (simplified)
      { id: "C4", element: "C", x: 120, y: 100, color: "#444444", radius: 15 },
      { id: "C5", element: "C", x: 100, y: 130, color: "#444444", radius: 15 },
      { id: "C6", element: "C", x: 220, y: 110, color: "#444444", radius: 15 },
      { id: "C7", element: "C", x: 240, y: 140, color: "#444444", radius: 15 },
      // Oxygen atoms
      { id: "O1", element: "O", x: 160, y: 85, color: "#ff4444", radius: 18 },
      { id: "O2", element: "O", x: 190, y: 155, color: "#ff4444", radius: 18 },
      { id: "O3", element: "O", x: 110, y: 80, color: "#ff4444", radius: 18 },
      { id: "O4", element: "O", x: 230, y: 90, color: "#ff4444", radius: 18 },
    ],
    bonds: [
      { id: "b1", atom1: "C1", atom2: "C2", type: "single", color: "#888888" },
      { id: "b2", atom1: "C2", atom2: "C3", type: "single", color: "#888888" },
      { id: "b3", atom1: "C1", atom2: "C4", type: "single", color: "#888888" },
      {
        id: "b4",
        atom1: "C4",
        atom2: "C5",
        type: "aromatic",
        color: "#666666",
      },
      { id: "b5", atom1: "C3", atom2: "C6", type: "single", color: "#888888" },
      {
        id: "b6",
        atom1: "C6",
        atom2: "C7",
        type: "aromatic",
        color: "#666666",
      },
      { id: "b7", atom1: "C2", atom2: "O1", type: "single", color: "#888888" },
      { id: "b8", atom1: "C3", atom2: "O2", type: "single", color: "#888888" },
      { id: "b9", atom1: "C4", atom2: "O3", type: "single", color: "#888888" },
      { id: "b10", atom1: "C6", atom2: "O4", type: "single", color: "#888888" },
    ],
  },
};

export const MolecularVisualization: React.FC<MolecularVisualizationProps> = ({
  molecule = defaultMolecules.water,
  showAnimation = false,
  showElectronDensity = false,
  width = 400,
  height = 300,
  onMoleculeChange,
}) => {
  const [currentMolecule, setCurrentMolecule] = useState(molecule);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showCharges, setShowCharges] = useState(false);
  const [renderMode, setRenderMode] = useState<
    "ballStick" | "spaceFill" | "wireframe"
  >("ballStick");
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setRotation((prev) => (prev + 1) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  const handleMoleculeSelect = (moleculeKey: string) => {
    const newMolecule = defaultMolecules[moleculeKey];
    setCurrentMolecule(newMolecule);
    if (onMoleculeChange) {
      onMoleculeChange(newMolecule);
    }
  };

  const getBondPath = (bond: Bond, atoms: Atom[]) => {
    const atom1 = atoms.find((a) => a.id === bond.atom1);
    const atom2 = atoms.find((a) => a.id === bond.atom2);

    if (!atom1 || !atom2) return "";

    const x1 = atom1.x * zoom;
    const y1 = atom1.y * zoom;
    const x2 = atom2.x * zoom;
    const y2 = atom2.y * zoom;

    if (bond.type === "double") {
      const offset = 3;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const perpX = (-dy / length) * offset;
      const perpY = (dx / length) * offset;

      return `M ${x1 + perpX} ${y1 + perpY} L ${x2 + perpX} ${y2 + perpY} M ${x1 - perpX} ${y1 - perpY} L ${x2 - perpX} ${y2 - perpY}`;
    } else if (bond.type === "triple") {
      const offset = 4;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const perpX = (-dy / length) * offset;
      const perpY = (dx / length) * offset;

      return `M ${x1} ${y1} L ${x2} ${y2} M ${x1 + perpX} ${y1 + perpY} L ${x2 + perpX} ${y2 + perpY} M ${x1 - perpX} ${y1 - perpY} L ${x2 - perpX} ${y2 - perpY}`;
    } else {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
  };

  const getBondStrokeWidth = (bondType: string) => {
    switch (bondType) {
      case "aromatic":
        return 2;
      case "double":
        return 1.5;
      case "triple":
        return 1.5;
      default:
        return 2;
    }
  };

  const getBondStrokeDasharray = (bondType: string) => {
    return bondType === "aromatic" ? "4,2" : "none";
  };

  const exportMolecule = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentMolecule.name.toLowerCase().replace(/\s+/g, "_")}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Molecule Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Atom className="w-5 h-5 mr-2 text-blue-600" />
              Molecular Viewer
            </span>
            <Badge variant="secondary">{currentMolecule.formula}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(defaultMolecules).map(([key, mol]) => (
              <Button
                key={key}
                size="sm"
                variant={
                  currentMolecule.name === mol.name ? "default" : "outline"
                }
                onClick={() => handleMoleculeSelect(key)}
                className="text-xs"
              >
                {mol.name}
              </Button>
            ))}
          </div>

          <div className="text-sm text-gray-600 mb-3">
            <strong>{currentMolecule.name}</strong>
            {currentMolecule.description && (
              <p className="mt-1 text-xs">{currentMolecule.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visualization Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              size="sm"
              variant={isAnimating ? "destructive" : "default"}
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex items-center text-xs"
            >
              {isAnimating ? (
                <Pause className="w-3 h-3 mr-1" />
              ) : (
                <Play className="w-3 h-3 mr-1" />
              )}
              {isAnimating ? "Stop" : "Rotate"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setRotation(0)}
              className="flex items-center text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2))}
              className="flex items-center text-xs"
            >
              <ZoomIn className="w-3 h-3 mr-1" />
              Zoom In
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
              className="flex items-center text-xs"
            >
              <ZoomOut className="w-3 h-3 mr-1" />
              Zoom Out
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              size="sm"
              variant={showLabels ? "default" : "outline"}
              onClick={() => setShowLabels(!showLabels)}
              className="flex items-center text-xs"
            >
              {showLabels ? (
                <Eye className="w-3 h-3 mr-1" />
              ) : (
                <EyeOff className="w-3 h-3 mr-1" />
              )}
              Labels
            </Button>

            <Button
              size="sm"
              variant={showCharges ? "default" : "outline"}
              onClick={() => setShowCharges(!showCharges)}
              className="flex items-center text-xs"
            >
              <Palette className="w-3 h-3 mr-1" />
              Charges
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={exportMolecule}
            className="w-full flex items-center text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export SVG
          </Button>
        </CardContent>
      </Card>

      {/* 3D Molecular Visualization */}
      <Card>
        <CardContent className="pt-4">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="bg-white"
            >
              <defs>
                {/* Gradient for electron density */}
                {showElectronDensity && (
                  <radialGradient
                    id="electronDensity"
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor="rgba(255,0,0,0.3)" />
                    <stop offset="100%" stopColor="rgba(0,0,255,0.1)" />
                  </radialGradient>
                )}

                {/* Filters for 3D effect */}
                <filter
                  id="shadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="2"
                    dy="2"
                    stdDeviation="1"
                    floodColor="rgba(0,0,0,0.3)"
                  />
                </filter>
              </defs>

              <g
                transform={`translate(${width / 2}, ${height / 2}) rotate(${rotation}) translate(${-width / 2}, ${-height / 2})`}
              >
                {/* Render bonds first */}
                {currentMolecule.bonds.map((bond) => (
                  <path
                    key={bond.id}
                    d={getBondPath(bond, currentMolecule.atoms)}
                    stroke={bond.color}
                    strokeWidth={getBondStrokeWidth(bond.type)}
                    strokeDasharray={getBondStrokeDasharray(bond.type)}
                    fill="none"
                    opacity={0.8}
                  />
                ))}

                {/* Render atoms */}
                {currentMolecule.atoms.map((atom) => (
                  <g key={atom.id}>
                    {/* Electron density cloud */}
                    {showElectronDensity && (
                      <circle
                        cx={atom.x * zoom}
                        cy={atom.y * zoom}
                        r={atom.radius * 2 * zoom}
                        fill="url(#electronDensity)"
                        opacity={0.3}
                      />
                    )}

                    {/* Main atom sphere */}
                    <circle
                      cx={atom.x * zoom}
                      cy={atom.y * zoom}
                      r={
                        renderMode === "spaceFill"
                          ? atom.radius * 1.5 * zoom
                          : atom.radius * zoom
                      }
                      fill={atom.color}
                      stroke="#333"
                      strokeWidth={renderMode === "wireframe" ? 2 : 1}
                      fillOpacity={renderMode === "wireframe" ? 0 : 1}
                      filter="url(#shadow)"
                    />

                    {/* Atom label */}
                    {showLabels && (
                      <text
                        x={atom.x * zoom}
                        y={atom.y * zoom + 4}
                        textAnchor="middle"
                        fontSize={12 * zoom}
                        fontWeight="bold"
                        fill="white"
                        stroke="black"
                        strokeWidth={0.5}
                      >
                        {atom.element}
                      </text>
                    )}

                    {/* Charge indicators */}
                    {showCharges &&
                      atom.charge !== undefined &&
                      atom.charge !== 0 && (
                        <text
                          x={atom.x * zoom + atom.radius * zoom + 8}
                          y={atom.y * zoom - atom.radius * zoom - 5}
                          fontSize={10 * zoom}
                          fontWeight="bold"
                          fill={atom.charge > 0 ? "#ff4444" : "#4444ff"}
                        >
                          {atom.charge > 0
                            ? `+${atom.charge.toFixed(2)}`
                            : atom.charge.toFixed(2)}
                        </text>
                      )}
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            Rotation: {rotation}° | Zoom: {(zoom * 100).toFixed(0)}%
          </div>
        </CardContent>
      </Card>

      {/* Molecular Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Formula:</strong> {currentMolecule.formula}
            </div>
            <div>
              <strong>Atoms:</strong> {currentMolecule.atoms.length}
            </div>
            <div>
              <strong>Bonds:</strong> {currentMolecule.bonds.length}
            </div>
            <div>
              <strong>Elements:</strong>{" "}
              {Array.from(
                new Set(currentMolecule.atoms.map((a) => a.element)),
              ).join(", ")}
            </div>
          </div>

          {currentMolecule.atoms.some((a) => a.charge !== undefined) && (
            <div className="mt-3 p-2 bg-blue-50 rounded">
              <div className="text-xs font-medium text-blue-800">
                Partial Charges
              </div>
              <div className="text-xs text-blue-600 mt-1">
                This molecule has polar covalent bonds with partial charges
                indicated.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MolecularVisualization;
