import { Link } from "wouter";
import { useState } from "react";
import AdminLoginModal from "@/components/AdminLoginModal";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <footer className="bg-[#111827] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="material-icons text-primary text-3xl">auto_awesome</span>
              <h3 className="text-xl font-bold">Dua<span className="text-primary">Prayer</span></h3>
            </div>
            <p className="text-white/70">A platform for Muslims to share and support each other through prayer.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Navigation</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><a href="#new-prayer" className="hover:text-primary transition-colors">New Prayer</a></li>
              <li><a href="#prayers" className="hover:text-primary transition-colors">All Prayers</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2 text-white/70">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Admin</h4>
            <p className="text-white/70 mb-4">Site administrators can log in to moderate prayers.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center text-white bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg transition-colors"
            >
              <span className="material-icons mr-2 text-sm">admin_panel_settings</span>
              Admin Login
            </button>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} DuaPrayer. All rights reserved.</p>
        </div>
      </div>
      
      <AdminLoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </footer>
  );
}
