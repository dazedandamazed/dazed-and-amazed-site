import { useState, useEffect } from "react";
import { thoughts } from "../data/thoughts";
import { Shuffle, X } from "lucide-react";

export function RandomThought() {
  const [currentThought, setCurrentThought] = useState(thoughts[0]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredThoughts, setFilteredThoughts] = useState(thoughts);

  const getRandomThought = (thoughtsList = thoughts) => {
    const randomIndex = Math.floor(Math.random() * thoughtsList.length);
    setCurrentThought(thoughtsList[randomIndex]);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    const filtered = thoughts.filter((thought) => thought.tags.includes(tag));
    setFilteredThoughts(filtered);
    getRandomThought(filtered);
  };

  const clearFilter = () => {
    setSelectedTag(null);
    setFilteredThoughts(thoughts);
    getRandomThought(thoughts);
  };

  useEffect(() => {
    getRandomThought();
  }, []);

  if (thoughts.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <p className="text-lg text-white">No thoughts yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Active Filter Display */}
          {selectedTag && (
            <div className="flex items-center justify-between border-b border-white pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">Filtering by:</span>
                <span className="px-3 py-1 bg-white text-black text-sm rounded">
                  {selectedTag}
                </span>
                <span className="text-sm text-white">
                  ({filteredThoughts.length} {filteredThoughts.length === 1 ? 'thought' : 'thoughts'})
                </span>
              </div>
              <button
                onClick={clearFilter}
                className="flex items-center space-x-1 text-sm text-white transition-colors hover:text-[#D9E800]"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Thought Text */}
          {currentThought && (
            <div className="space-y-6">
              <p className="text-white text-xl sm:text-2xl leading-relaxed font-normal">
                {currentThought.text}
              </p>
            </div>
          )}

          {/* Tags */}
          {currentThought && (
            <div className="flex flex-wrap gap-2">
              {currentThought.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 border text-sm rounded transition-colors ${
                    selectedTag === tag
                      ? "bg-white text-black border-white"
                      : "border-white bg-black text-white hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Get Another Button */}
          <div className="pt-4">
            <button
              onClick={() => getRandomThought(filteredThoughts)}
              className="flex items-center space-x-2 rounded bg-white px-6 py-3 text-black transition-colors hover:bg-[#D9E800]"
            >
              <Shuffle className="w-4 h-4" />
              <span>Another Thought</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
