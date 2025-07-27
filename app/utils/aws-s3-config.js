"use server";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.AWS_S3_API_URL || "",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadFileToS3(file, fileName, prefix) {
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  // Récupère l'extension du fichier
  const fileExtension = file.name.split(".").pop();
  // Utilise le nom fourni ou le nom du fichier sans extension
  const baseFileName = fileName ?? file.name.replace(/\.[^/.]+$/, "");
  const uniqueFileName = `${prefix}/${baseFileName}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
    Key: uniqueFileName,
    Body: buffer,
    ContentType: file.type,
  });

  try {
    await s3.send(command);
    return `${process.env.R2_URL}/${uniqueFileName}`;
  } catch (error) {
    console.log("error: dans la config s3", error);
    throw new Error("Erreur lors de l'upload S3 : " + error.message);
  }
}

export async function deleteFileFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
    Key: key,
  });

  try {
    await s3.send(command);
    return true;
  } catch (error) {
    console.log("Erreur lors de la suppression S3 :", error);
    throw new Error("Erreur lors de la suppression S3 : " + error.message);
  }
}
