"use client";

import { deleteImagesAction } from "@/app/actions";
import { useClientUpload } from "@/app/utils/hook/useClientUpload";
import { Button } from "@/components/ui/button";
import { extractFileIdFromUrl } from "@/lib/dryApiFunction/extractUrl";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function DropZoneVideo({ getInfo }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [isPending, startTransition] = useTransition();

  const { uploadFile, getFileStatus, resetFileStatus, FILE_STATUS } =
    useClientUpload();

  const handleUploadComplete = async (finalUrl, key) => {
    console.log(`✅ Upload completed: ${finalUrl}`);

    // Notifier le parent component
    if (getInfo) {
      await getInfo(finalUrl);
    }

    // Ajouter l'URL à notre liste
    setUrls((prevUrls) => [...prevUrls, finalUrl]);
  };

  const handleDelete = async (fileKey, fileName) => {
    startTransition(async () => {
      try {
        if (fileKey) {
          console.log("🗑️ Deleting from S3:", fileKey, fileName);
          const result = await deleteImagesAction(fileKey);
          if (result?.success) {
            // Supprimer de la liste des fichiers
            setFiles((prevFiles) =>
              prevFiles.filter((item) => item.file.name !== fileName)
            );
            // Supprimer de la liste des URLs
            setUrls((prevUrls) => {
              const fileIndex = files.findIndex(
                (f) => f.file.name === fileName
              );
              return prevUrls.filter((_, index) => index !== fileIndex);
            });
            // Reset le status d'upload
            resetFileStatus(fileName);
            toast.success(`${fileName} deleted successfully!`);
          } else {
            toast.error(result?.message || "Failed to delete file");
          }
        } else {
          // Juste supprimer de la queue locale
          setFiles((prevFiles) =>
            prevFiles.filter((item) => item.file.name !== fileName)
          );
          resetFileStatus(fileName);
          toast.success(`Removed ${fileName} from queue`);
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`Error deleting ${fileName}: ${error.message}`);
      }
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      console.log("📥 Files dropped:", acceptedFiles.length);
      console.log(
        "Accepted files:",
        acceptedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          sizeMB: (f.size / (1024 * 1024)).toFixed(2) + " MB",
          type: f.type,
        }))
      );

      if (acceptedFiles.length > 0) {
        // Ajouter les fichiers à la liste
        const newFiles = acceptedFiles.map((file) => ({
          file,
          id: "",
          addedAt: Date.now(),
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);

        // Démarrer l'upload de chaque fichier
        for (const file of acceptedFiles) {
          console.log(`🚀 Starting client upload for: ${file.name}`);

          // Upload avec callback de completion
          uploadFile(file, "videos", handleUploadComplete);
        }
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB (limite S3)
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv"],
    },
    onDropRejected: (rejectedFiles) => {
      console.log("❌ Files rejected:", rejectedFiles);
      rejectedFiles.forEach(({ file, errors }) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        console.log(`Rejected: ${file.name} (${sizeMB} MB)`, errors);

        if (errors[0]?.code === "file-too-large") {
          toast.error(`${file.name} is too large (max 5GB)`);
        } else if (errors[0]?.code === "file-invalid-type") {
          toast.error(`${file.name} is not a supported video format`);
        } else {
          toast.error(`Error with ${file.name}: ${errors[0]?.message}`);
        }
      });
    },
  });

  const getStatusInfo = (fileName) => {
    const status = getFileStatus(fileName);

    switch (status.status) {
      case FILE_STATUS.PENDING:
        return {
          icon: Clock,
          color: "text-netflix-gray",
          bgColor: "bg-white/5",
          text: "En file…",
          showProgress: false,
        };
      case FILE_STATUS.GETTING_URL:
        return {
          icon: Upload,
          color: "text-netflix-light",
          bgColor: "bg-white/5",
          text: "Préparation…",
          showProgress: false,
        };
      case FILE_STATUS.UPLOADING:
        return {
          icon: Upload,
          color: "text-netflix-light",
          bgColor: "bg-white/5",
          text: `${status.progress}%`,
          showProgress: true,
          progress: status.progress,
        };
      case FILE_STATUS.COMPLETED:
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          text: "✓ Envoyée",
          showProgress: false,
        };
      case FILE_STATUS.ERROR:
        return {
          icon: AlertCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/15",
          text: "✗ Échec",
          showProgress: false,
        };
      default:
        return {
          icon: Clock,
          color: "text-netflix-gray",
          bgColor: "bg-white/5",
          text: "En attente…",
          showProgress: false,
        };
    }
  };

  return (
    <>
      <div
        {...getRootProps({
          className: cn(
            "w-full p-5 mt-2 border-dashed rounded-xl border-2 transition-colors duration-200 cursor-pointer",
            isDragActive
              ? "border-netflix-red bg-netflix-red/10"
              : "border-white/15 bg-white/[0.02] hover:border-netflix-red/60"
          ),
        })}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <p className="text-center text-netflix-red py-4">
            Déposez vos vidéos ici…
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <VideoIcon className="w-8 h-8 text-netflix-gray" />
              <p className="text-sm text-netflix-light">Glissez-déposez la vidéo</p>
              <p className="text-xs text-netflix-gray">MP4 · MOV · MKV — max 5 Go</p>
            </div>

            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-netflix-light hover:border-netflix-red/60 hover:bg-white/5 hover:text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choisir une vidéo
            </Button>
          </div>
        )}
      </div>

      {/* Liste des fichiers avec status détaillé */}
      {files.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium text-netflix-gray mb-3">
            Envoi ({files.length} fichier{files.length > 1 ? "s" : ""})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map(({ file }, index) => {
              const fileUrl = urls[index];
              const fileKey = fileUrl ? extractFileIdFromUrl(fileUrl) : null;
              const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
              const statusInfo = getStatusInfo(file.name);
              const IconComponent = statusInfo.icon;

              return (
                <div
                  key={`${file.name}-${index}`}
                  className={cn(
                    "relative p-3 rounded-lg border border-white/10 transition-all duration-200",
                    statusInfo.bgColor
                  )}
                >
                  {/* Barre de progression en arrière-plan */}
                  {statusInfo.showProgress && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-netflix-red/20 transition-all duration-300 ease-out"
                        style={{ width: `${statusInfo.progress}%` }}
                      />
                    </div>
                  )}

                  <div className="relative flex items-start gap-3">
                    {/* Icône de status */}
                    <div className="flex-shrink-0">
                      <IconComponent
                        className={cn("w-8 h-8", statusInfo.color)}
                      />
                    </div>

                    {/* Info du fichier */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-netflix-light truncate pr-2">
                          {file.name}
                        </h4>

                        {/* Bouton de suppression */}
                        <Button
                          onClick={() => handleDelete(fileKey, file.name)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-netflix-gray hover:text-red-500 hover:bg-red-500/10 rounded-full flex-shrink-0"
                          disabled={isPending}
                        >
                          <XIcon className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-netflix-gray">
                          {fileSizeMB} Mo
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            statusInfo.color
                          )}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Barre de progression détaillée */}
                      {statusInfo.showProgress && (
                        <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                          <div
                            className="bg-netflix-red h-1 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${statusInfo.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </>
  );
}
