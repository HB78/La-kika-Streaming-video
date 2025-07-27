// hooks/useClientUpload.js
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const FILE_STATUS = {
  PENDING: "pending",
  GETTING_URL: "getting_url",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
};

export function useClientUpload() {
  const [uploadState, setUploadState] = useState({});

  const updateFileStatus = useCallback(
    (fileName, status, progress = 0, error = null) => {
      setUploadState((prev) => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          status,
          progress,
          error,
          lastUpdated: Date.now(),
        },
      }));
    },
    []
  );

  const getPresignedUrl = async (file, prefix = "videos") => {
    console.log(`🔑 Getting presigned URL for: ${file.name}`);

    const response = await fetch("/api/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        prefix,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get presigned URL");
    }

    return response.json();
  };

  const uploadToS3Direct = (file, presignedUrl, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Configuration des événements
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
          console.log(`📊 ${file.name}: ${progress}%`);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          console.log(`✅ ${file.name} uploaded successfully to S3`);
          resolve({
            status: "success",
            statusCode: xhr.status,
          });
        } else {
          console.error(
            `❌ S3 upload failed for ${file.name}:`,
            xhr.status,
            xhr.statusText
          );
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        console.error(`❌ Network error uploading ${file.name}`);
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("timeout", () => {
        console.error(`❌ Upload timeout for ${file.name}`);
        reject(new Error("Upload timeout"));
      });

      xhr.addEventListener("abort", () => {
        console.log(`⏹️ Upload cancelled for ${file.name}`);
        reject(new Error("Upload cancelled"));
      });

      // Configuration et envoi
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      // Timeout long pour les gros fichiers (30 minutes)
      xhr.timeout = 30 * 60 * 1000;

      xhr.send(file);

      // Retourner l'objet xhr pour pouvoir l'annuler si besoin
      return xhr;
    });
  };

  const uploadFile = async (file, prefix = "videos", onComplete = null) => {
    const fileName = file.name;
    console.log(
      `🚀 Starting client-side upload for: ${fileName} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    );

    try {
      // 1. État initial
      updateFileStatus(fileName, FILE_STATUS.PENDING);

      // 2. Obtenir l'URL présignée
      updateFileStatus(fileName, FILE_STATUS.GETTING_URL);
      const { presignedUrl, finalUrl, key } = await getPresignedUrl(
        file,
        prefix
      );

      console.log(`🔑 Got presigned URL for ${fileName}`);

      // 3. Upload direct vers S3 avec progress
      updateFileStatus(fileName, FILE_STATUS.UPLOADING, 0);

      await uploadToS3Direct(file, presignedUrl, (progress) => {
        updateFileStatus(fileName, FILE_STATUS.UPLOADING, progress);
      });

      // 4. Succès
      updateFileStatus(fileName, FILE_STATUS.COMPLETED, 100);
      toast.success(`${fileName} uploaded successfully! 🎉`);

      // Callback optionnel
      if (onComplete) {
        await onComplete(finalUrl, key);
      }

      return {
        success: true,
        finalUrl,
        key,
      };
    } catch (error) {
      console.error(`❌ Upload failed for ${fileName}:`, error);
      updateFileStatus(fileName, FILE_STATUS.ERROR, 0, error.message);

      // Messages d'erreur contextuels
      let errorMsg = error.message;
      if (error.message.includes("File too large")) {
        errorMsg = "File too large (max 5GB)";
      } else if (error.message.includes("timeout")) {
        errorMsg = "Upload timeout - try again";
      } else if (error.message.includes("Network error")) {
        errorMsg = "Network error - check your connection";
      }

      toast.error(`Upload failed: ${errorMsg}`);

      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  const uploadMultipleFiles = async (
    files,
    prefix = "videos",
    onEachComplete = null
  ) => {
    console.log(`📤 Starting upload of ${files.length} files`);

    const results = [];

    // Upload séquentiel pour éviter de surcharger
    for (const file of files) {
      try {
        const result = await uploadFile(file, prefix, onEachComplete);
        results.push({ file: file.name, ...result });
      } catch (error) {
        results.push({
          file: file.name,
          success: false,
          error: error.message,
        });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(
      `📊 Upload completed: ${successful} successful, ${failed} failed`
    );

    if (successful > 0) {
      toast.success(
        `${successful} file${successful > 1 ? "s" : ""} uploaded successfully!`
      );
    }
    if (failed > 0) {
      toast.error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
    }

    return results;
  };

  const getFileStatus = useCallback(
    (fileName) => {
      return (
        uploadState[fileName] || { status: FILE_STATUS.PENDING, progress: 0 }
      );
    },
    [uploadState]
  );

  const resetFileStatus = useCallback((fileName) => {
    setUploadState((prev) => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
  }, []);

  const resetAllStatus = useCallback(() => {
    setUploadState({});
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    getFileStatus,
    resetFileStatus,
    resetAllStatus,
    uploadState,
    FILE_STATUS,
  };
}
