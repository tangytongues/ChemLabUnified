import { useParams } from "wouter";
import React from "react";
import Header from "@/components/header";
import ChemicalEquilibriumApp from "@/experiments/ChemicalEquilibrium/components/ChemicalEquilibriumApp";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Experiment() {
  const { id } = useParams<{ id: string }>();
  const experimentId = parseInt(id || "1");

  // Since we only have Chemical Equilibrium experiment (id: 3)
  // redirect other experiment IDs to not found
  if (experimentId !== 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Experiment Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested experiment (ID: {experimentId}) is not available.
              Only the Chemical Equilibrium experiment is currently implemented.
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

  // For Chemical Equilibrium experiment, use the modular component
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ChemicalEquilibriumApp onBack={() => window.history.back()} />
    </div>
  );
}
