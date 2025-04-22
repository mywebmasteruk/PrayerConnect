import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <svg className="h-6 w-6 text-gray-800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V2M12 22V20M4 12H2M22 12H20M19.7778 19.7778L18.3636 18.3636M19.7778 4.2222L18.3636 5.6364M4.2222 19.7778L5.6364 18.3636M4.2222 4.2222L5.6364 5.6364M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-lg font-medium text-gray-900">Du'aa Prayer</h1>
        </Link>
        
        <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Admin
        </Link>
      </div>
    </header>
  );
}
