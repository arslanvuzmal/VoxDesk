import { Navbar } from "@/components/ui/navbar";
import { GuidedClientStory } from "@/components/demo/guided-story";

export default function DemoStoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10 w-full">
        <GuidedClientStory />
      </div>
    </div>
  );
}
