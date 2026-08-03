import { Navbar } from "@/components/ui/navbar";
import { LiveCallConsole } from "@/components/calls/live-console";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10 w-full">
        <LiveCallConsole />
      </div>
    </div>
  );
}
