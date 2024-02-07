"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "../utils/uploadthing";

export default function Home({ getInfo }) {
  const [files, setFiles] = useState([]);

  return (
    <>
      <UploadButton
        endpoint="videoUploader"
        onClientUploadComplete={(res) => {
          console.log(" all Files: ", res);
          setFiles(res[0].url);
          getInfo(res[0]);
          toast.success("Upload Completed");
        }}
        onUploadError={(error) => {
          toast.error("ERROR! " + error.message);
        }}
      />
    </>
  );
}
