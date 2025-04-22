import { useState, useEffect } from "react";
import { prayerCategories } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFilterProps {
  category: string;
  search: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
}

export default function SearchFilter({ 
  category, 
  search, 
  onCategoryChange, 
  onSearchChange 
}: SearchFilterProps) {
  const [searchInput, setSearchInput] = useState(search);
  
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, onSearchChange]);
  
  return (
    <div className="max-w-xl mx-auto mb-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search prayers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
        </div>
        
        <Select
          value={category}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {prayerCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
