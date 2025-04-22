import { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="material-icons text-primary text-3xl">auto_awesome</span>
          <h1 className="text-xl md:text-2xl font-bold text-dark">Dua<span className="text-primary">Prayer</span></h1>
        </Link>
        
        <nav className="hidden md:flex space-x-6 text-dark">
          <Link href="/" className="font-medium hover:text-primary transition-colors">Home</Link>
          <a href="#new-prayer" className="font-medium hover:text-primary transition-colors">New Prayer</a>
          <a href="#prayers" className="font-medium hover:text-primary transition-colors">All Prayers</a>
          <a href="#about" className="font-medium hover:text-primary transition-colors">About</a>
        </nav>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="md:hidden text-dark"
        >
          <span className="material-icons">menu</span>
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white pb-4 border-t border-neutral-dark">
          <nav className="container mx-auto px-4 flex flex-col space-y-3">
            <Link href="/" className="py-2 font-medium hover:text-primary transition-colors">Home</Link>
            <a href="#new-prayer" className="py-2 font-medium hover:text-primary transition-colors">New Prayer</a>
            <a href="#prayers" className="py-2 font-medium hover:text-primary transition-colors">All Prayers</a>
            <a href="#about" className="py-2 font-medium hover:text-primary transition-colors">About</a>
          </nav>
        </div>
      )}
    </header>
  );
}
