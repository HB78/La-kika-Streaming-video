"use client";

import { Button } from "@/components/ui/button";
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
import { deleteEpisode, deleteSerie } from "@/fetches/fetches";
import { Film, FolderPlus, Trash2, TvIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  // fonction de suppression
  const handleDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "movie") {
      await deleteMovie(itemToDelete.id);
      setLocalMovies(
        localMovies.filter((movie) => movie.id !== itemToDelete.id)
      );
    } else if (itemToDelete.type === "tvshow") {
      await deleteSerie(itemToDelete.id);
      setLocalTvShows(
        localTvShows.filter((show) => show.id !== itemToDelete.id)
      );
      // Aussi supprimer les épisodes associés
      const updatedEpisodes = { ...localEpisodes };
      delete updatedEpisodes[itemToDelete.id];
      setLocalEpisodes(updatedEpisodes);

      // Si la série supprimée est la série sélectionnée, réinitialiser
      if (selectedShow === itemToDelete.id) {
        setSelectedShow(null);
        setActiveTab("tvshows");
      }
    } else if (itemToDelete.type === "episode") {
      await deleteEpisode(itemToDelete.id);
      if (selectedShow && localEpisodes[selectedShow]) {
        // Mise à jour des épisodes pour la série sélectionnée
        const updatedEpisodes = {
          ...localEpisodes,
          [selectedShow]: localEpisodes[selectedShow].filter(
            (ep) => ep.id !== itemToDelete.id
          ),
        };
        setLocalEpisodes(updatedEpisodes);
      }
    }

    setDeleteDialog(false);
    setItemToDelete(null);
  };

  const confirmDelete = (type, id) => {
    setItemToDelete({ type, id });
    setDeleteDialog(true);
  };

  const filteredMovies = localMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTvShows = localTvShows.filter((show) =>
    show.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Link href={"/"}>
              <h1 className="text-red-600 text-4xl font-bold cursor-pointer">
                LA KIKA
              </h1>
            </Link>{" "}
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
                <SidebarMenuButton>
                  <FolderPlus className="mr-2" />
                  <span>
                    <Link href={"/movie"}>Add Movies and Series</Link>
                  </span>
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
            <p className="text-sm text-neutral-400">© 2025 LAKIKA</p>
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
                        width={210}
                        height={130}
                        quality={80}
                        priority
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
                        width={210}
                        height={130}
                        quality={50}
                        priority
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
