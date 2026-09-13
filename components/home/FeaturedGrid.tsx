import { PromptCard } from "@/components/prompt/PromptCard";
import type { Prompt } from "@/types";

/** Responsive prompt grid: 1 / 2 / 3 / 4 columns as width allows. */
export function FeaturedGrid({ prompts }: { prompts: Prompt[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
