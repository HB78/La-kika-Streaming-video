const { generateComponents } = require("@uploadthing/react");
//le code en bas est utilisé lorsque l'on utilise typescript
// const { OurFileRouter } = require("@/app/api/uploadthing/core");

export const { UploadButton, UploadDropzone, Uploader } = generateComponents();
