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
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          text: "Queued...",
          showProgress: false,
        };
      case FILE_STATUS.GETTING_URL:
        return {
          icon: Upload,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          text: "Preparing...",
          showProgress: false,
        };
      case FILE_STATUS.UPLOADING:
        return {
          icon: Upload,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          text: `${status.progress}%`,
          showProgress: true,
          progress: status.progress,
        };
      case FILE_STATUS.COMPLETED:
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          text: "✅ Done",
          showProgress: false,
        };
      case FILE_STATUS.ERROR:
        return {
          icon: AlertCircle,
          color: "text-red-500",
          bgColor: "bg-red-50",
          text: "❌ Failed",
          showProgress: false,
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          text: "Waiting...",
          showProgress: false,
        };
    }
  };

  return (
    <>
      <div
        {...getRootProps({
          className: cn(
            "w-full p-6 mt-6 border-dashed rounded-xl border-2 transition-all duration-200 cursor-pointer",
            isDragActive
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
              : "border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50"
          ),
        })}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-16 h-16 text-blue-500 animate-bounce" />
            <p className="text-lg font-medium text-blue-600">
              Drop your videos here!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-3">
              <VideoIcon className="w-16 h-16 text-blue-400" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  Drag & drop your videos here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: MP4, MOV, AVI, MKV, WebM • Max size: 5GB
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  ⚡ Direct upload to cloud (bypasses server limits)
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Videos
            </Button>
          </div>
        )}
      </div>

      {/* Liste des fichiers avec status détaillé */}
      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Upload Progress ({files.length} file{files.length > 1 ? "s" : ""})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    "relative p-4 rounded-lg border transition-all duration-200",
                    statusInfo.bgColor,
                    "hover:shadow-md"
                  )}
                >
                  {/* Barre de progression en arrière-plan */}
                  {statusInfo.showProgress && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-blue-200/50 transition-all duration-300 ease-out"
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
                        <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                          {file.name}
                        </h4>

                        {/* Bouton de suppression */}
                        <Button
                          onClick={() => handleDelete(fileKey, file.name)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full flex-shrink-0"
                          disabled={isPending}
                        >
                          <XIcon className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {fileSizeMB} MB
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
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-out"
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

      {/* Stats globales */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
        <div>
          Files: {files.length} | URLs: {urls.length}
        </div>
        {files.length > 0 && (
          <div>
            Total:{" "}
            {(
              files.reduce((acc, { file }) => acc + file.size, 0) /
              (1024 * 1024)
            ).toFixed(1)}{" "}
            MB
          </div>
        )}
      </div>
    </>
  );
}
