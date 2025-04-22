import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Join Our Prayer Community</h2>
        <p className="max-w-2xl mx-auto mb-8 text-white/90">
          Share your prayers, support others, and experience the power of collective du'aa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            size="lg"
            variant="secondary"
            className="bg-white hover:bg-[#f9fafb] text-primary font-medium"
          >
            <a href="#new-prayer">Share Your Prayer</a>
          </Button>
          <Button 
            asChild
            size="lg"
            variant="outline"
            className="bg-primary/20 hover:bg-primary/30 text-white border border-white/30 font-medium"
          >
            <a href="#prayers">Support Others</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
