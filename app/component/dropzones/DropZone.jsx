"use client";

import { deleteImagesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { extractFileIdFromUrl } from "@/lib/dryApiFunction/extractUrl";
import { cn } from "@/lib/utils";
import { ImageIcon, XIcon } from "lucide-react";
import Image from "next/image";
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

export function DropZone({ getInfo }) {
  const [files, setFiles] = useState([]);
  const [isPending, startTransition] = useTransition();

  // ✅ Fonction pour mettre à jour le statut d'un fichier
  const updateFileStatus = (fileName, status, url = null, id = null) => {
    console.log(`Updating file ${fileName} to status: ${status}`);
    setFiles((prevFiles) =>
      prevFiles.map((item) =>
        item.file.name === fileName
          ? { ...item, status, url, id: id || item.id }
          : item
      )
    );
  };

  // Upload des images vers S3/R2
  const uploadToS3 = async (file) => {
    console.log(`Starting upload for: ${file.name}, size: ${file.size} bytes`);

    try {
      updateFileStatus(file.name, FILE_STATUS.UPLOADING);

      const data = new FormData();
      data.set("file", file);
      data.set("prefix", "images");

      console.log("Sending request to /api/s3-upload...");

      const res = await fetch("/api/s3-upload", {
        method: "POST",
        body: data,
      });

      console.log("Response status:", res.status);

      const result = await res.json();
      console.log("Response data:", result);

      if (res.ok) {
        // ✅ CORRECTION: Utiliser result.url au lieu de url
        await getInfo(result.url);
        updateFileStatus(file.name, FILE_STATUS.COMPLETED, result.url);
        toast.success(`File ${file.name} uploaded successfully!`);
      } else {
        updateFileStatus(file.name, FILE_STATUS.ERROR);
        toast.error(`Upload failed: ${result.error || "Unknown error"}`);
        console.error("Upload error:", result);
      }
    } catch (error) {
      console.error("Upload error:", error);
      updateFileStatus(file.name, FILE_STATUS.ERROR);
      toast.error(`Network error uploading ${file.name}`);
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
          const result = await deleteImagesAction(fileId);
          if (result?.success) {
            setFiles((prevFiles) =>
              prevFiles.filter((item) => item.file.name !== fileName)
            );
            // On prévient le parent que l'affiche n'existe plus (sinon l'aperçu
            // de gauche garde l'ancienne URL). getInfo("") remet photoUrl à vide.
            // if (getInfo) : on vérifie que getInfo contient bien quelque chose
            // (qu'il a été passé en prop) avant de l'appeler.
            if (getInfo) getInfo("");
            toast.success(`File ${fileName} deleted successfully!`);
          } else {
            toast.error(result?.message || "Failed to delete file");
          }
        } else {
          // Remove from UI if still uploading
          setFiles((prevFiles) =>
            prevFiles.filter((item) => item.file.name !== fileName)
          );
          // Idem : on annule l'affiche côté parent.
          // if (getInfo) : on vérifie que getInfo contient quelque chose avant de l'appeler.
          if (getInfo) getInfo("");
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
      // ✅ Add files with initial status
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          file,
          id: "",
          status: FILE_STATUS.PENDING,
          url: null,
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
    maxSize: 1024 * 1024 * 10, // ✅ 10MB au lieu de 800MB (plus raisonnable)
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    onDropRejected: (rejectedFiles) => {
      console.log("Files rejected:", rejectedFiles);
      rejectedFiles.forEach(({ file, errors }) => {
        console.log(`Rejected file: ${file.name}`, errors);
        if (errors[0]?.code === "file-too-large") {
          toast.error(`${file.name} is too large (max 10MB)`);
        } else if (errors[0]?.code === "file-invalid-type") {
          toast.error(`${file.name} is not an accepted image type`);
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
            "w-[100%] p-5 mt-2 border-dashed rounded-xl border-2 lg:w-full border-white/15 hover:border-netflix-red/60 transition-colors duration-200 bg-white/[0.02] cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center text-netflix-red py-4">
            Déposez vos images ici…
          </p>
        ) : (
          <div className="flex flex-col items-center gap-y-4">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-netflix-gray" />
              <p className="text-sm text-netflix-light">Glissez-déposez l&apos;affiche</p>
              <p className="text-xs text-netflix-gray">PNG · JPG — max 10 Mo</p>
            </div>
            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-netflix-light hover:border-netflix-red/60 hover:bg-white/5 hover:text-white"
            >
              Choisir une image
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Affichage corrigé des fichiers uploadés */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
        {files.map(({ file, id, status, url }, index) => {
          // On extrait la clé S3/R2 à partir de l'URL (ex: "images/monimage.jpg")
          // C'est cette clé qui est nécessaire pour la suppression côté serveur (S3 ne connaît pas juste le nom du fichier)
          const fileKey = url ? extractFileIdFromUrl(url) : null;

          return (
            <div
              key={`${file.name}-${index}`}
              className="relative w-full group"
            >
              <div className="relative">
                {status === FILE_STATUS.COMPLETED && url ? (
                  // ✅ Image uploadée avec succès
                  <>
                    <Image
                      src={url}
                      alt={file.name}
                      width={200}
                      height={200}
                      className={cn(
                        "object-cover rounded-lg size-16 cursor-pointer shadow-sm shadow-green-300"
                      )}
                    />
                    <div className="mt-1 text-xs text-center text-green-500">
                      ✓ Envoyée
                    </div>
                  </>
                ) : (
                  // ✅ État de chargement ou d'erreur
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-16 rounded-lg transition-all",
                      status === FILE_STATUS.UPLOADING &&
                        "bg-white/10 animate-pulse",
                      status === FILE_STATUS.ERROR && "bg-red-500/15",
                      status === FILE_STATUS.PENDING && "bg-white/5"
                    )}
                  >
                    <ImageIcon
                      className={cn(
                        "w-8 h-8",
                        status === FILE_STATUS.UPLOADING && "text-netflix-light",
                        status === FILE_STATUS.ERROR && "text-red-500",
                        status === FILE_STATUS.PENDING && "text-netflix-gray"
                      )}
                    />

                    {/* Loading spinner pour l'upload */}
                    {status === FILE_STATUS.UPLOADING && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status text */}
                <div className="mt-1 text-xs text-center">
                  {status === FILE_STATUS.PENDING && (
                    <span className="text-netflix-gray">Préparation…</span>
                  )}
                  {status === FILE_STATUS.UPLOADING && (
                    <span className="text-netflix-light">Envoi…</span>
                  )}
                  {status === FILE_STATUS.ERROR && (
                    <span className="text-red-500">✗ Échec</span>
                  )}
                </div>

                <div className="mt-1 text-xs text-netflix-gray text-center truncate max-w-[80px]">
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
                  disabled={isPending && status === FILE_STATUS.UPLOADING}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
