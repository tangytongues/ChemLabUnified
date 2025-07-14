import { useState } from "react";
import { useExperiments } from "@/hooks/use-experiments";
import { Link } from "wouter";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";
import ExperimentCard from "@/components/experiment-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, FlaskConical, Clock, Star, Users } from "lucide-react";

export default function Home() {
  console.log("🏠 Home page component is rendering!");
  const { data: experiments, isLoading, error } = useExperiments();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Filter experiments (will only show aspirin synthesis now)
  const filteredExperiments = experiments?.filter((experiment) => {
    const matchesSearch = experiment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || experiment.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || experiment.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = Array.from(
    new Set(experiments?.map((exp) => exp.category) || []),
  );
  const difficulties = Array.from(
    new Set(experiments?.map((exp) => exp.difficulty) || []),
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Experiments
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to load experiments. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />

      {/* Statistics Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <FlaskConical className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1</div>
              <div className="text-gray-600">Expert Experiment</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">45</div>
              <div className="text-gray-600">Minutes Duration</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600">Students Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiments Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Virtual Chemistry Laboratory
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master the art of aspirin synthesis through our interactive
              virtual laboratory. Learn organic chemistry reactions safely and
              effectively.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search experiments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Experiments Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <Skeleton className="h-48 w-full mb-4 rounded-lg" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredExperiments && filteredExperiments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExperiments.map((experiment, index) => (
                <Link
                  key={index}
                  href={`/experiment/${index + 1}`}
                  className="block transform hover:scale-105 transition-transform"
                >
                  <ExperimentCard experiment={experiment} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No experiments found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}

          {/* Featured Experiment Highlight */}
          {experiments && experiments.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Featured: Aspirin Synthesis
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Learn how to synthesize acetylsalicylic acid (aspirin) from
                  salicylic acid and acetic anhydride. This comprehensive
                  experiment demonstrates esterification reactions and
                  purification techniques in organic chemistry.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    Organic Chemistry
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    Intermediate Level
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    45 Minutes
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30"
                  >
                    8 Steps
                  </Badge>
                </div>
                <Link href="/experiment/1">
                  <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                    Start Experiment →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
