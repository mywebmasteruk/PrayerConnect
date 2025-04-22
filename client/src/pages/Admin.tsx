import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Prayer, prayerCategories } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilter from "@/components/SearchFilter";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Eye, Heart, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Admin() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const limit = 10;

  // Check if user is admin
  const { data: adminStatus, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ['/api/admin/status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/status', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to check admin status');
      return res.json();
    },
  });

  // Redirect to home if not admin
  useEffect(() => {
    if (!checkingAdmin && adminStatus && !adminStatus.isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You need to be logged in as admin to access this page.",
      });
      navigate("/");
    }
  }, [adminStatus, checkingAdmin, navigate, toast]);

  // Fetch prayers
  const { data, isLoading } = useQuery<{
    prayers: Prayer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }>({
    queryKey: ['/api/admin/prayers', page, limit, category, search],
    queryFn: async ({ queryKey }) => {
      const [_, page, limit, category, search] = queryKey;
      let url = `/api/admin/prayers?page=${page}&limit=${limit}`;
      
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      
      return fetch(url, { credentials: 'include' }).then(res => res.json());
    },
    enabled: !!adminStatus?.isAdmin,
  });

  // Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      await apiRequest("PATCH", `/api/admin/prayers/${id}`, {
        is_published: isPublished,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prayers'] });
      toast({
        title: "Prayer Updated",
        description: "The prayer has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update the prayer. Please try again.",
      });
    },
  });

  // Delete prayer
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/prayers/${id}`, undefined);
    },
    onSuccess: () => {
      setConfirmDeleteOpen(false);
      setSelectedPrayer(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prayers'] });
      toast({
        title: "Prayer Deleted",
        description: "The prayer has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete the prayer. Please try again.",
      });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout", undefined);
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    },
  });

  if (checkingAdmin || (adminStatus && !adminStatus.isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </>
            )}
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manage Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchFilter 
              category={category} 
              search={search}
              onCategoryChange={(c) => { setCategory(c); setPage(1); }}
              onSearchChange={(s) => { setSearch(s); setPage(1); }}
            />
            
            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">Loading prayers...</p>
              </div>
            ) : data?.prayers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No prayers found.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.prayers.map((prayer) => {
                      // Format date
                      const timeAgo = prayer.created_at 
                        ? formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })
                        : "recently";
                      
                      // Find category label
                      const categoryLabel = prayerCategories.find(
                        c => c.value === prayer.category
                      )?.label || prayer.category;
                      
                      return (
                        <TableRow key={prayer.id}>
                          <TableCell>{prayer.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{prayer.content}</TableCell>
                          <TableCell>{prayer.author}</TableCell>
                          <TableCell>{categoryLabel || "—"}</TableCell>
                          <TableCell>{timeAgo}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={prayer.is_published ? "default" : "destructive"}
                              className="cursor-pointer"
                              onClick={() => 
                                togglePublishMutation.mutate({
                                  id: prayer.id,
                                  isPublished: !prayer.is_published,
                                })
                              }
                            >
                              {prayer.is_published ? "Published" : "Unpublished"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2 text-sm">
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {prayer.ameen_count || 0}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {prayer.view_count || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => {
                                setSelectedPrayer(prayer);
                                setConfirmDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {data && data.pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prayer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrayer && (
            <div className="my-4 p-4 bg-muted rounded-md">
              <p className="font-semibold">{selectedPrayer.author}</p>
              <p className="mt-1 text-sm">{selectedPrayer.content}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPrayer && deleteMutation.mutate(selectedPrayer.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
