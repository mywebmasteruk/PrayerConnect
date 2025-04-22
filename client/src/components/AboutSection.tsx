import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">About DuaPrayer</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Info className="text-primary mr-2 h-5 w-5" />
                Our Purpose
              </h3>
              <p className="text-dark/80 mb-4">
                DuaPrayer is a platform created to help Muslims share their prayers (du'aa) with one another, 
                creating a supportive community of believers.
              </p>
              <p className="text-dark/80">
                We believe in the power of collective prayer and the comfort it brings to know 
                others are making du'aa for your concerns.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Lightbulb className="text-primary mr-2 h-5 w-5" />
                How It Works
              </h3>
              <ul className="text-dark/80 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="text-[#f59e0b] text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Share your prayers anonymously - no account needed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-[#f59e0b] text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Support others by saying "Ameen" to their prayers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-[#f59e0b] text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Browse prayers by category to find those relevant to you</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-[#f59e0b] text-sm mt-1 mr-2 h-4 w-4" />
                  <span>All prayers are moderated to ensure they follow Islamic guidelines</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Card className="mt-10 bg-[#f9fafb] border-[#e5e7eb]">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">Guidelines for Sharing Prayers</h3>
              <ul className="text-dark/80 space-y-2">
                <li className="flex items-start">
                  <AlertTriangle className="text-destructive text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Be respectful and follow Islamic etiquette when making du'aa</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-destructive text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Do not use this platform to criticize others or spread negativity</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-destructive text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Avoid sharing very private matters that should remain confidential</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-destructive text-sm mt-1 mr-2 h-4 w-4" />
                  <span>Remember that all prayers are moderated and may be removed if inappropriate</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
