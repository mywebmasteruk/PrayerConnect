import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section 
      className="relative py-16 md:py-24 bg-cover bg-center" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519817650390-64a93db51149?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
    >
      <div className="absolute inset-0 bg-[#111827] opacity-60"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Share Your Prayers</h2>
        <p className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-8">A place where Muslims can share their du'aa and pray for others. No registration needed.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            <a href="#new-prayer">Share Your Prayer</a>
          </Button>
          <Button 
            asChild
            size="lg"
            variant="outline"
            className="bg-white hover:bg-[#f9fafb] text-primary font-medium"
          >
            <a href="#prayers">Pray for Others</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
