"use client";

import { Button } from "@/components/ui/button";
import {
  deleteEpisode,
  deleteMovie,
  deleteSerie,
} from "./../../../fetches/fetches"; // Ajuster le chemin d'importation selon ton projet

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Film, Trash2, TvIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardComponent({ movies, tvShows }) {
  const [activeTab, setActiveTab] = useState("movies");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [localMovies, setLocalMovies] = useState(movies);
  const [localTvShows, setLocalTvShows] = useState(tvShows);

  // Reformater les données d'épisodes au format attendu par le composant
  const [localEpisodes, setLocalEpisodes] = useState(() => {
    const formattedEpisodes = {};

    // Parcourir les séries pour extraire les épisodes
    tvShows.forEach((show) => {
      if (show.episodeOwned && Array.isArray(show.episodeOwned)) {
        formattedEpisodes[show.id] = show.episodeOwned;
      }
    });

    return formattedEpisodes;
  });

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);

      switch (itemToDelete.type) {
        case "movie":
          await deleteMovie(itemToDelete.id);
          setLocalMovies(
            localMovies.filter((movie) => movie.id !== itemToDelete.id)
          );
          break;

        case "tvshow":
          await deleteSerie(itemToDelete.id);
          setLocalTvShows(
            localTvShows.filter((show) => show.id !== itemToDelete.id)
          );

          // Supprimer les épisodes associés
          const updatedEpisodes = { ...localEpisodes };
          delete updatedEpisodes[itemToDelete.id];
          setLocalEpisodes(updatedEpisodes);

          // Réinitialiser si nécessaire
          if (selectedShow === itemToDelete.id) {
            setSelectedShow(null);
            setActiveTab("tvshows");
          }
          break;

        case "episode":
          await deleteEpisode(itemToDelete.id);

          if (selectedShow && localEpisodes[selectedShow]) {
            setLocalEpisodes({
              ...localEpisodes,
              [selectedShow]: localEpisodes[selectedShow].filter(
                (ep) => ep.id !== itemToDelete.id
              ),
            });
          }
          break;

        default:
          console.warn("Type d'élément inconnu:", itemToDelete.type);
          break;
      }

      toast.success(`${itemToDelete.type} supprimé avec succès`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setDeleteDialog(false);
      setItemToDelete(null);
      setIsDeleting(false);
    }
  };

  // Composant interne qui utilise useSidebar
  const DashboardContent = () => {
    const { isMobile, setMobileOpen } = useSidebar();

    // Listen for tab change events from sidebar
    useEffect(() => {
      const handleTabChange = (event) => {
        setActiveTab(event.detail.tab);
        if (event.detail.show !== undefined) {
          setSelectedShow(event.detail.show);
        }
        if (isMobile) {
          setMobileOpen(false);
        }
      };

      window.addEventListener("changeTab", handleTabChange);
      return () => window.removeEventListener("changeTab", handleTabChange);
    }, [isMobile, setMobileOpen]);

    // Obtenir les épisodes filtrés pour la série sélectionnée
    const filteredEpisodes =
      selectedShow && localEpisodes[selectedShow]
        ? localEpisodes[selectedShow].filter((episode) =>
            episode.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    return (
      <>
        <Sidebar>
          <SidebarHeader>
            <h1 className="text-2xl font-bold text-netflix-red">StreamAdmin</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    setActiveTab("movies");
                    setSelectedShow(null);
                    if (isMobile) setMobileOpen(false);
                  }}
                  isActive={activeTab === "movies"}
                >
                  <Film className="mr-2" />
                  <span>Movies</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    setActiveTab("tvshows");
                    setSelectedShow(null);
                    if (isMobile) setMobileOpen(false);
                  }}
                  isActive={activeTab === "tvshows" && !selectedShow}
                >
                  <TvIcon className="mr-2" />
                  <span>TV Shows</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {selectedShow && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveTab("episodes");
                      if (isMobile) setMobileOpen(false);
                    }}
                    isActive={activeTab === "episodes"}
                  >
                    <span className="ml-6">Episodes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-sm text-neutral-400">© 2025 StreamAdmin</p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-netflix-black">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 text-white" />
              <h2 className="text-xl font-semibold text-white">
                {activeTab === "movies" && "Movies"}
                {activeTab === "tvshows" && "TV Shows"}
                {activeTab === "episodes" &&
                  selectedShow &&
                  `Episodes - ${localTvShows.find((show) => show.id === selectedShow)?.title}`}
              </h2>
            </div>
            <div className="w-1/3">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </header>

          <main className="p-6 bg-netflix-black min-h-screen text-white">
            {activeTab === "movies" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                {filteredMovies.map((movie, index) => (
                  <Card
                    key={movie.id}
                    className="bg-netflix-black border-neutral-800 overflow-hidden group relative"
                  >
                    <CardContent className="p-0">
                      <Image
                        src={movie?.photo || "/placeholder.svg"}
                        alt={movie.title || "Movie"}
                        width={300}
                        height={450}
                        quality={80}
                        priority={index < 6}
                        loading={index < 6 ? "eager" : "lazy"}
                        className="w-full h-auto object-cover transition-all duration-300"
                      />
                      <div className="p-3">
                        <h3 className="font-medium">{movie.title}</h3>
                        <p className="text-sm text-neutral-400">
                          {movie.year || movie.genre}
                        </p>
                      </div>
                      <Button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                        onClick={() => confirmDelete("movie", movie.id)}
                      >
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "tvshows" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                {filteredTvShows.map((show, index) => (
                  <Card
                    key={show.id}
                    className="bg-netflix-black border-neutral-800 overflow-hidden group relative cursor-pointer"
                    onClick={() => {
                      setSelectedShow(show.id);
                      setActiveTab("episodes");
                    }}
                  >
                    <CardContent className="p-0">
                      <Image
                        src={show?.photo || "/placeholder.svg"}
                        alt={show.title || "TV Show"}
                        width={300}
                        height={450}
                        quality={50}
                        priority={index < 6}
                        loading={index < 6 ? "eager" : "lazy"}
                        className="w-full h-auto object-cover transition-all duration-300"
                      />
                      <div className="p-3">
                        <h3 className="font-medium">{show.title}</h3>
                        <p className="text-sm text-neutral-400">
                          {show.episodeOwned?.length || 0} Episodes
                        </p>
                      </div>
                      <Button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete("tvshow", show.id);
                        }}
                      >
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "episodes" && selectedShow && (
              <div className="space-y-4">
                {filteredEpisodes.length > 0 ? (
                  filteredEpisodes.map((episode) => (
                    <Card
                      key={episode.id}
                      className="bg-netflix-black border-neutral-800 group relative"
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{episode.title}</h3>
                          <p className="text-sm text-neutral-400">
                            Season {episode.season || 1}, Episode{" "}
                            {episode.episode || episode.episodeNumber || 1}
                          </p>
                        </div>
                        <Button
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                          onClick={() => confirmDelete("episode", episode.id)}
                        >
                          <Trash2 className="h-10 w-10 size-40" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-10 text-neutral-400">
                    No episodes found for this show
                  </div>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
      </>
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardContent />

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-netflix-black border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete this {itemToDelete?.type}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="text-white border border-white hover:bg-white hover:text-black"
              onClick={() => setDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
