import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // For current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pages[pages.length - 1] !== i - 1) {
        pages.push(null); // Add ellipsis indicator
      }
      pages.push(i);
    }
    
    // Always include last page if more than 1 page
    if (totalPages > 1) {
      if (pages[pages.length - 1] !== totalPages - 1) {
        pages.push(null); // Add ellipsis indicator
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-10">
      <div className="inline-flex rounded-md shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-l-lg"
        >
          Previous
        </Button>
        
        {pageNumbers.map((page, index) => 
          page === null ? (
            <Button 
              key={`ellipsis-${index}`}
              variant="outline"
              size="sm"
              disabled
              className="px-4 py-2 text-sm font-medium rounded-none"
            >
              ...
            </Button>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`px-4 py-2 text-sm font-medium rounded-none ${
                currentPage === page ? "bg-primary text-white" : ""
              }`}
            >
              {page}
            </Button>
          )
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-r-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
