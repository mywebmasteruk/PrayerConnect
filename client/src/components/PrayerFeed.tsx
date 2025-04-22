import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Prayer } from "@shared/schema";
import PrayerCard from "@/components/PrayerCard";
import PrayerSkeleton from "@/components/PrayerSkeleton";
import SearchFilter from "@/components/SearchFilter";
import Pagination from "@/components/Pagination";

export default function PrayerFeed() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const limit = 6;

  const { data, isLoading, isError } = useQuery<{
    prayers: Prayer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }>({
    queryKey: ['/api/prayers', page, limit, category, search],
    queryFn: async ({ queryKey }) => {
      // Build query string
      const [_, page, limit, category, search] = queryKey;
      let url = `/api/prayers?page=${page}&limit=${limit}`;
      
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      
      return fetch(url, { credentials: 'include' }).then(res => res.json());
    },
  });

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1); // Reset to first page when changing filters
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when searching
  };

  return (
    <section id="prayers" className="py-12 md:py-16 bg-[#f9fafb]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Recent Prayers</h2>
        <p className="text-center text-dark/70 max-w-2xl mx-auto mb-8">
          Read and support others by saying "Ameen" to their prayers.
        </p>
        
        <SearchFilter 
          category={category} 
          search={search}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, index) => (
              <PrayerSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-destructive">Error loading prayers. Please try again later.</p>
          </div>
        ) : data?.prayers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No prayers found. Be the first to share one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {data?.prayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} />
            ))}
          </div>
        )}
        
        {data && data.pagination.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  );
}
