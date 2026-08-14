import { DemoStudio } from '@/components/demo/demo-studio';
import { Navbar } from '@/components/ui/navbar';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#080C12]">
      <Navbar />
      <DemoStudio />
    </div>
  );
}
