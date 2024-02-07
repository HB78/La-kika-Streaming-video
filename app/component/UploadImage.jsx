"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "../utils/uploadthing";

export default function Home({ getInfo }) {
  const [files, setFiles] = useState([]);
  return (
    <>
      <div
        aria-labelledby="uploadLabel"
        className="flex min-auto flex-col items-center justify-between border border-blue-500 border-dashed"
      >
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            // Do something with the response
            console.log(" all Files: ", res);
            setFiles(res[0].url);
            getInfo(res[0]);
            toast.success("Upload Completed");
          }}
          onUploadError={(error) => {
            // Do something with the error.
            toast.error("ERROR! " + error.message);
          }}
        />
        {files.length > 0 && (
          <div
            aria-live="polite"
            className="w-[250px] h-[250px] relative mx-auto bg-blue-500 object-contain"
          >
            <Image
              alt="Uploaded Image Preview"
              priority={true}
              fill={true}
              src={files}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </>
  );
}
