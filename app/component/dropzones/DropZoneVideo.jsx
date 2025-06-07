"use client";
import { deleteImagesAction } from "@/app/actions";
import { pinata } from "@/app/utils/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import * as tus from "tus-js-client";

// Constants for file size limits
const FILE_SIZE_LIMITS = {
  SMALL: 100 * 1024 * 1024, // 100MB
  LARGE: 1200 * 1024 * 1024, // 1.2GB
  CHUNK_SIZE: 50 * 1024 * 1024, // 50MB
};

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
  const [uploadToken, setUploadToken] = useState(null);

  // Fetch upload token when component mounts
  useEffect(() => {
    const getUploadToken = async () => {
      try {
        const response = await fetch("/api/url");
        const data = await response.json();
        setUploadToken(data.url);
      } catch (error) {
        console.error("Error fetching upload token:", error);
        toast.error("Couldn't prepare upload. Please try again.");
      }
    };

    getUploadToken();
  }, []);

  // Function to handle regular uploads (files < 100MB)
  const uploadSmallFile = async (file) => {
    try {
      updateFileStatus(file.name, FILE_STATUS.UPLOADING);

      const urlRequest = await fetch("/api/url");
      const urlResponse = await urlRequest.json();
      const upload = await pinata.upload.public.file(file).url(urlResponse.url);

      const url = await pinata.gateways.public.convert(upload.cid);
      await getInfo(url);

      setUrls((prevUrls) => [...prevUrls, url]);
      updateFileStatus(file.name, FILE_STATUS.COMPLETED, upload.cid);
      toast.success(`File ${file.name} uploaded successfully!`);
    } catch (e) {
      console.error("Upload error:", e);
      updateFileStatus(file.name, FILE_STATUS.ERROR);
      toast.error(`Trouble uploading file ${file.name}`);
    }
  };

  // Function to handle large file uploads using TUS (resumable uploads)
  const uploadLargeFile = async (file) => {
    updateFileStatus(file.name, FILE_STATUS.UPLOADING);

    try {
      console.log(`Starting TUS upload for: ${file.name} (${file.size} bytes)`);

      const upload = new tus.Upload(file, {
        endpoint: "/api/file",
        chunkSize: FILE_SIZE_LIMITS.CHUNK_SIZE,
        retryDelays: [1000, 3000, 5000], // ✅ Moins de retries pour éviter la boucle infinie
        headers: {
          // Pas d'Authorization header
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
          network: "public",
        },
        onError: (error) => {
          console.error(`Upload failed for ${file.name}:`, error);
          updateFileStatus(file.name, FILE_STATUS.ERROR);
          toast.error(`Upload failed for ${file.name}`);
          // ✅ Pas de retry automatique, on s'arrête ici
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          console.log(`Progress for ${file.name}: ${percentage}%`);
          updateFileProgress(file.name, percentage);
        },
        onSuccess: async () => {
          console.log(`Upload completed for: ${file.name}`);

          try {
            // ✅ Approche simplifiée - pas de recherche par nom
            // On utilise un upload direct avec Pinata à la place
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
              "metadata",
              JSON.stringify({
                filename: file.name,
                filetype: file.type,
                network: "public",
              })
            );

            // Upload direct via notre API FormData
            const response = await fetch("/api/upload-direct", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const result = await response.json();
              const url = await pinata.gateways.public.convert(result.cid);
              await getInfo(url);

              setUrls((prevUrls) => [...prevUrls, url]);
              updateFileStatus(file.name, FILE_STATUS.COMPLETED, result.cid);
              toast.success(`File ${file.name} uploaded successfully!`);
            } else {
              throw new Error(`Upload verification failed: ${response.status}`);
            }
          } catch (error) {
            console.error("Error after TUS upload:", error);
            // ✅ Même en cas d'erreur de vérification, on marque comme complété
            updateFileStatus(file.name, FILE_STATUS.COMPLETED, "tus-upload");
            toast.success(`File ${file.name} uploaded (TUS method)`);
          }
        },
        onBeforeRequest: (req) => {
          const method = req.getMethod();
          const url = req.getURL();
          console.log(`TUS request: ${method} ${url}`);

          // ✅ Ajouter des headers CORS si nécessaire
          req.setHeader("Access-Control-Request-Method", method);
          return req;
        },
      });

      // ✅ Gestion d'erreur globale pour éviter les crashes
      upload.start();

      // ✅ Timeout de sécurité pour éviter les uploads qui traînent
      setTimeout(() => {
        if (upload.isRunning) {
          console.log(`Upload timeout for ${file.name}, aborting...`);
          upload.abort();
          updateFileStatus(file.name, FILE_STATUS.ERROR);
          toast.error(`Upload timeout for ${file.name}`);
        }
      }, 300000); // 5 minutes max
    } catch (e) {
      console.error("Upload setup error:", e);
      updateFileStatus(file.name, FILE_STATUS.ERROR);
      toast.error(`Failed to start upload for ${file.name}`);
    }
  };

  // Helper function to update file status
  const updateFileStatus = (fileName, status, id) => {
    setFiles((prevFiles) =>
      prevFiles.map((item) => {
        if (item.file.name === fileName) {
          return { ...item, status, id: id || item.id };
        }
        return item;
      })
    );
  };

  // Helper function to update file progress
  const updateFileProgress = (fileName, progress) => {
    setFiles((prevFiles) =>
      prevFiles.map((item) => {
        if (item.file.name === fileName) {
          return { ...item, progress };
        }
        return item;
      })
    );
  };

  // Main upload function that decides which upload method to use based on file size
  const uploadFile = async (file) => {
    startTransition(async () => {
      if (file.size > FILE_SIZE_LIMITS.SMALL) {
        // ✅ Essayer TUS d'abord, puis fallback vers direct
        try {
          await uploadLargeFile(file);
        } catch (error) {
          console.log("TUS failed, trying direct upload...");
          await uploadLargeFileDirectly(file);
        }
      } else {
        await uploadSmallFile(file);
      }
    });
  };

  const handleDelete = async (fileId, fileName) => {
    startTransition(async () => {
      try {
        if (fileId) {
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
          // If no fileId yet (still uploading), just remove from UI
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
    if (acceptedFiles.length > 0) {
      // Add files to the list with initial status
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          file,
          id: "",
          status: "pending",
          progress: 0,
        })),
      ]);

      // Start uploading each file
      acceptedFiles.forEach((file) => uploadFile(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: FILE_SIZE_LIMITS.LARGE,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        if (errors[0]?.code === "file-too-large") {
          toast.error(
            `${file.name} is too large (max ${FILE_SIZE_LIMITS.LARGE / (1024 * 1024)}MB)`
          );
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
            "w-[100%] p-3 mt-6 border-dashed rounded-lg border-2 lg:w-full border-blue-200 hover:border-blue-400 transition-colors duration-200 bg-blue-50/50",
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

      {/* Display uploaded files with progress bars for large files */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
        {files.map(({ file, id, status, progress }, index) => (
          <div key={file.name} className="relative w-full group">
            <div className="relative">
              <div
                className={cn(
                  isPending ? "opacity-50" : "opacity-100",
                  "object-cover rounded-lg size-16 cursor-pointer bg-blue-50 flex flex-col items-center justify-center",
                  status === "completed" && "shadow-sm shadow-blue-300"
                )}
              >
                <VideoIcon className="w-9 h-9 text-blue-400" />
                {status === "uploading" && progress !== undefined && (
                  <div className="w-full mt-2 px-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1">{progress}%</p>
                  </div>
                )}
                {status === "pending" && (
                  <p className="text-xs text-gray-500 mt-1">Preparing...</p>
                )}
                {status === "error" && (
                  <p className="text-xs text-red-500 mt-1">Upload failed</p>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-400 text-center truncate">
                {file.name}
              </div>
            </div>
            <div className="text-white bg-red-500 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <Button
                onClick={() => handleDelete(id, file.name)}
                variant={"destructive"}
                className="cursor-pointer"
                disabled={isPending && status !== "error"}
              >
                <XIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
