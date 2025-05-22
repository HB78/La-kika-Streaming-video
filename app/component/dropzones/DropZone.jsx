"use client";
import { deleteImagesAction } from "@/actions/deleteImagesAction";
import { pinata } from "@/app/utils/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

// files sont tous les fichiers uploadés regroupés dans un array et acceptedFiles sont les fichiers que l'on vient de glisser dans le dropzone

export function DropZone({ getInfo }) {
  const [files, setFiles] = useState([]);

  //je mets un array pour stocker les urls des images uploadées
  //si j'avais à stocker le dernier fichier uploadé je mettrais un objet
  const [urls, setUrls] = useState([]); // Pour stocker les URLs des images uploadées

  const [isPending, startTransition] = useTransition(); // Ajout de useTransition

  // Upload des images dans pinata
  const uploadFile = async (file) => {
    startTransition(async () => {
      try {
        const urlRequest = await fetch("/api/url"); // Fetches the temporary upload URL
        const urlResponse = await urlRequest.json(); // Parse response
        const upload = await pinata.upload.public
          .file(file)
          .url(urlResponse.url); // Upload the file with the signed URL
        const url = await pinata.gateways.public.convert(upload.cid); // Convert CID to URL
        await getInfo(url);

        // Ajoutez ici le code pour gérer le succès de l'upload
        setUrls((prevUrls) => [...prevUrls, url]); // Store the URL of the uploaded image
        setFiles((prevFiles) =>
          prevFiles.map((item) =>
            item.file === file ? { ...item, id: upload.cid } : item
          )
        );
        toast.success(`file ${file.name} uploaded successfully!`);
      } catch (e) {
        console.error("Upload error:", e);
        toast("Trouble uploading file");
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
            toast.success(`File ${fileName} deleted successfully!`);
          } else {
            toast.error(result?.message);
          }
        }
      } catch (error) {}
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    if (acceptedFiles.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({ file, id: "" })),
      ]);
      // acceptedFiles.forEach(uploadFile);
      acceptedFiles.forEach((file) => uploadFile(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 1024 * 1024 * 800, // 800MB
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDropRejected: (rejectedFiles) => {
      // Gérer les fichiers rejetés (trop grands ou type incorrect)
      rejectedFiles.forEach(({ file, errors }) => {
        if (errors[0]?.code === "file-too-large") {
          toast.error(`${file.name} is too large (max 800MB)`);
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
            "w-[100%] p-3 mt-6 border-dashed rounded-lg border-2 lg:w-full border-violet-200 hover:border-violet-400 transition-colors duration-200 bg-violet-50/50",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center text-violet-600">
            Drop your images here ...
          </p>
        ) : (
          <div className="flex flex-col items-center gap-y-5">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 text-violet-400" />
              <p className="text-gray-600">Drag 'n' drop your images here</p>
            </div>
            <Button
              variant="outline"
              className="border-violet-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600"
            >
              Select Images
            </Button>
          </div>
        )}
      </div>

      {/* // Affichage des fichiers uploadés */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
        {files.map(({ file, id }, index) => (
          <div key={file.name} className="relative w-full group">
            <div className="relative">
              {index < urls.length ? (
                <>
                  <Image
                    src={urls[index]}
                    alt={file.name}
                    width={200}
                    height={200}
                    className={cn(
                      isPending ? "opacity-50" : "opacity-100",
                      "object-cover rounded-lg size-16 cursor-pointer shadow-sm shadow-violet-300"
                    )}
                  />
                  <div className="mt-2 text-sm text-gray-400 text-center truncate">
                    {file.name}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-16 bg-violet-50 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-violet-400" />
                  <p className="text-sm text-gray-500 mt-2">Uploading..</p>
                </div>
              )}
            </div>
            <div className="text-white bg-red-500 absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <Button
                onClick={() => handleDelete(id, file.name)}
                variant="destructive"
                disabled={isPending}
                type="submit"
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
