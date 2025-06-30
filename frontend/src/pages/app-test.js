import LayoutApp from "@/components/LayoutApp";
import { Button } from "@/components/ui/button";
// REMOVED: import { colors } from "@/styles/colors"; 

export default function AppTest() {
  return (
    <LayoutApp>
      <h1 className="font-lato text-lg font-medium">Button Test</h1>
      
      {/* Your existing Button component test */}
      <div className="flex gap-4 mt-4">
        <Button color="purple">Primary Button</Button>
        <Button variant="outline" color="yellow">Outline Button</Button>
      </div>
      
      {/* Purple box with white text - using direct Tailwind classes */}
      <div className="w-full p-4 mt-6 text-white bg-purple-600">
        test purple box
      </div>

      {/* Orange H2 - using direct Tailwind classes */}
      <h2 className="text-xl font-bold mt-4 text-orange-500">
        this is working
      </h2>
    </LayoutApp>
  );
}