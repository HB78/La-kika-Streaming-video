"use client";
import { deleteImagesAction } from "@/app/actions";
import { pinata } from "@/app/utils/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VideoIcon, XIcon } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

// Constants for file size limits
const FILE_SIZE_LIMITS = {
  SMALL: 50 * 1024 * 1024, // 50MB - limite Next.js par défaut
  LARGE: 1200 * 1024 * 1024, // 1.2GB
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

  // Function to handle small file uploads via API route
  const uploadSmallFile = async (file) => {
    try {
      updateFileStatus(file.name, FILE_STATUS.UPLOADING);

      // Créer FormData avec le fichier
      const formData = new FormData();
      formData.append("file", file);

      // Upload via notre API route
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadData = await response.json();

      // Construire l'URL du fichier
      const gatewayUrl =
        process.env.NEXT_PUBLIC_GATEWAY_URL ||
        "https://lime-worried-lungfish-409.mypinata.cloud";
      const url = `${gatewayUrl}/ipfs/${uploadData.cid}`;

      await getInfo(url);
      setUrls((prevUrls) => [...prevUrls, url]);
      updateFileStatus(file.name, FILE_STATUS.COMPLETED, uploadData.cid);
      toast.success(`File ${file.name} uploaded successfully!`);
    } catch (e) {
      console.error("Upload error:", e);
      updateFileStatus(file.name, FILE_STATUS.ERROR);
      toast.error(`Trouble uploading file ${file.name}: ${e.message}`);
    }
  };

  // Function to handle large file uploads via signed URL
  const uploadLargeFile = async (file) => {
    try {
      updateFileStatus(file.name, FILE_STATUS.UPLOADING);

      // Obtenir une URL signée pour l'upload direct
      const urlResponse = await fetch("/api/url");
      if (!urlResponse.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { url: signedUrl } = await urlResponse.json();

      // Upload direct vers Pinata avec l'URL signée
      const upload = await pinata.upload.public.file(file).url(signedUrl);

      // Construire l'URL finale
      const gatewayUrl =
        process.env.NEXT_PUBLIC_GATEWAY_URL ||
        "https://lime-worried-lungfish-409.mypinata.cloud";
      const finalUrl = `${gatewayUrl}/ipfs/${upload.cid}`;

      await getInfo(finalUrl);
      setUrls((prevUrls) => [...prevUrls, finalUrl]);
      updateFileStatus(file.name, FILE_STATUS.COMPLETED, upload.cid);
      toast.success(`File ${file.name} uploaded successfully!`);
    } catch (e) {
      console.error("Upload error:", e);
      updateFileStatus(file.name, FILE_STATUS.ERROR);
      toast.error(`Trouble uploading file ${file.name}: ${e.message}`);
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

  // Main upload function that decides which method to use
  const uploadFile = async (file) => {
    if (file.size > FILE_SIZE_LIMITS.SMALL) {
      await uploadLargeFile(file);
    } else {
      await uploadSmallFile(file);
    }
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
      acceptedFiles.forEach((file) => {
        startTransition(async () => {
          await uploadFile(file);
        });
      });
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

      {/* Display uploaded files */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
        {files.map(({ file, id, status }, index) => (
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
                {status === "uploading" && (
                  <div className="w-full mt-2 px-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-center mt-1">Uploading...</p>
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
