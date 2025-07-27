"use client";
import { deleteImagesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { extractFileIdFromUrl } from "@/lib/dryApiFunction/extractUrl";
import { cn } from "@/lib/utils";
import { VideoIcon, XIcon } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

// File status types
const FILE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
};

export function DropZoneVideo({ getInfo }) {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [isPending, startTransition] = useTransition();

  // ✅ FONCTION MANQUANTE AJOUTÉE
  const updateFileStatus = (fileName, status, progress = 0) => {
    console.log(
      `Updating file ${fileName} to status: ${status}, progress: ${progress}`
    );
    setFiles((prevFiles) =>
      prevFiles.map((item) =>
        item.file.name === fileName ? { ...item, status, progress } : item
      )
    );
  };

  // Fonction d'upload S3 avec debug
  const uploadToS3 = async (file) => {
    console.log(`Starting upload for: ${file.name}, size: ${file.size} bytes`);

    try {
      updateFileStatus(file.name, FILE_STATUS.UPLOADING);

      const data = new FormData();
      data.set("file", file);
      data.set("prefix", "videos");

      console.log("Sending request to /api/s3-upload...");

      const res = await fetch("/api/s3-upload", {
        method: "POST",
        body: data,
      });

      console.log("Response status:", res.status);

      const result = await res.json();
      console.log("Response data:", result);

      if (res.ok) {
        await getInfo(result.url);
        setUrls((prevUrls) => [...prevUrls, result.url]);
        updateFileStatus(file.name, FILE_STATUS.COMPLETED);
        toast.success(`File ${file.name} uploaded successfully!`);
      } else {
        updateFileStatus(file.name, FILE_STATUS.ERROR);
        toast.error(`Upload failed: ${result.error || "Unknown error"}`);
        console.error("Upload error:", result);
      }
    } catch (error) {
      console.error("Network error:", error);
      updateFileStatus(file.name, FILE_STATUS.ERROR);
      toast.error(`Network error: ${error.message}`);
    }
  };

  // Main upload function
  const uploadFile = async (file) => {
    console.log("uploadFile called for:", file.name);
    startTransition(async () => {
      await uploadToS3(file);
    });
  };

  const handleDelete = async (fileId, fileName) => {
    startTransition(async () => {
      try {
        if (fileId) {
          console.log("fileId:", fileId);
          console.log("fileName:", fileName);
          const result = await deleteImagesAction(fileId);
          if (result?.success) {
            setFiles((prevFiles) =>
              prevFiles.filter((item) => item.file.name !== fileName)
            );
            setUrls((prevUrls) =>
              prevUrls.filter((_, index) => files[index].file.name !== fileName)
            );
            toast.success(`File ${fileName} deleted successfully!`);
          } else {
            toast.error(result?.message || "Failed to delete file");
            console.error("Delete error details:", result?.message);
          }
        } else {
          setFiles((prevFiles) =>
            prevFiles.filter((item) => item.file.name !== fileName)
          );
          toast.success(`Removed ${fileName} from queue`);
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`Error deleting ${fileName}: ${error.message}`);
      }
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    console.log("Files dropped:", acceptedFiles.length);
    console.log(
      "Accepted files:",
      acceptedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    if (acceptedFiles.length > 0) {
      // Add files to the list with initial status
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          file,
          id: "",
          status: FILE_STATUS.PENDING,
          progress: 0,
        })),
      ]);

      // Start uploading each file
      acceptedFiles.forEach((file) => {
        console.log(`Starting upload process for: ${file.name}`);
        uploadFile(file);
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 2500 * 1024 * 1024, // ✅ 1000MB = 1GB
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    onDropRejected: (rejectedFiles) => {
      console.log("Files rejected:", rejectedFiles);
      rejectedFiles.forEach(({ file, errors }) => {
        console.log(`Rejected file: ${file.name}`, errors);
        if (errors[0]?.code === "file-too-large") {
          toast.error(`${file.name} is too large (max 1GB)`);
        } else if (errors[0]?.code === "file-invalid-type") {
          toast.error(`${file.name} is not an accepted video type`);
        } else {
          toast.error(`Error with file ${file.name}: ${errors[0]?.message}`);
        }
      });
    },
  });

  return (
    <>
      <div
        {...getRootProps({
          className:
            "w-[100%] p-3 mt-6 border-dashed rounded-lg border-2 lg:w-full border-blue-200 hover:border-blue-400 transition-colors duration-200 bg-blue-50/50 cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center text-blue-600">Drop your videos here ...</p>
        ) : (
          <div className="flex flex-col items-center gap-y-5">
            <div className="flex flex-col items-center gap-2">
              <VideoIcon className="w-12 h-12 text-blue-400" />
              <p className="text-gray-600">Drag 'n' drop your videos here,</p>
              <p className="text-xs text-gray-500">Max size: 1GB</p>
            </div>
            <Button
              variant="outline"
              className="border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            >
              Select Videos
            </Button>
          </div>
        )}
      </div>

      {/* Display uploaded files */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
        {files.map(({ file, status }, index) => {
          // On récupère l'URL S3/R2 correspondant à ce fichier (retournée lors de l'upload)
          const fileUrl = urls[index];
          // On extrait la clé S3/R2 à partir de l'URL (ex: "videos/YourForma.mp4")
          // C'est cette clé qui est nécessaire pour la suppression côté serveur (S3 ne connaît pas juste le nom du fichier)
          const fileKey = fileUrl ? extractFileIdFromUrl(fileUrl) : null;

          return (
            <div
              key={`${file.name}-${index}`}
              className="relative w-full group"
            >
              <div className="relative">
                <div
                  className={cn(
                    "object-cover rounded-lg size-16 cursor-pointer bg-blue-50 flex flex-col items-center justify-center transition-all",
                    status === "uploading" && "opacity-75 animate-pulse",
                    status === "completed" &&
                      "shadow-sm shadow-green-300 bg-green-50",
                    status === "error" && "shadow-sm shadow-red-300 bg-red-50"
                  )}
                >
                  <VideoIcon
                    className={cn(
                      "w-9 h-9",
                      status === "completed"
                        ? "text-green-500"
                        : status === "error"
                          ? "text-red-500"
                          : status === "uploading"
                            ? "text-blue-500"
                            : "text-blue-400"
                    )}
                  />

                  {/* Progress indicator */}
                  {status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Status text */}
                <div className="mt-1 text-xs text-center">
                  {status === "pending" && (
                    <span className="text-gray-500">Preparing...</span>
                  )}
                  {status === "uploading" && (
                    <span className="text-blue-500">Uploading...</span>
                  )}
                  {status === "completed" && (
                    <span className="text-green-500">✓ Uploaded</span>
                  )}
                  {status === "error" && (
                    <span className="text-red-500">✗ Failed</span>
                  )}
                </div>

                <div className="mt-1 text-xs text-gray-400 text-center truncate max-w-[80px]">
                  {/* file.name est utilisé ici uniquement pour l'affichage du nom du fichier à l'utilisateur */}
                  {file.name}
                </div>
              </div>

              {/*
                Bouton de suppression (croix rouge)
                - On passe fileKey (clé S3/R2) à handleDelete pour supprimer le bon fichier côté serveur
                - On passe file.name pour mettre à jour l'UI (retirer le fichier de la liste affichée et afficher un toast personnalisé)
                - fileKey est indispensable pour la suppression réelle sur S3/R2
                - file.name n'est utilisé que côté client pour l'expérience utilisateur
              */}
              <div className="absolute -top-2 -right-2 opacity-100 group-hover:opacity-100 transition-opacity duration-300 bg-red-500 rounded-full">
                <Button
                  onClick={() => handleDelete(fileKey, file.name)}
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  disabled={isPending && status === "uploading"}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-500">
        Files in state: {files.length} | URLs: {urls.length}
      </div>
    </>
  );
}
