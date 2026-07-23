// app/api/presigned-url/route.js
import { isAdmin } from "@/lib/dryApiFunction/isAdmin";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.AWS_S3_API_URL || "",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req) {
  console.log("🔑 API /presigned-url called");

  // Vérification admin
  const adminCheck = await isAdmin();
  if (adminCheck.status !== 200) {
    return adminCheck;
  }

  try {
    const {
      fileName,
      fileType,
      fileSize,
      prefix = "videos",
    } = await req.json();

    console.log("📋 Request data:", { fileName, fileType, fileSize, prefix });

    // Validations
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 },
      );
    }

    // Limite de taille (5GB - limite S3 pour single upload)
    const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
    if (fileSize && fileSize > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 5GB` },
        { status: 413 },
      );
    }

    // Générer un nom de fichier unique avec timestamp
    const fileExtension = fileName.split(".").pop();
    const baseFileName = fileName.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${prefix}/${baseFileName}-${timestamp}-${randomSuffix}.${fileExtension}`;

    console.log(`🏷️ Generated unique filename: ${uniqueFileName}`);

    // Créer la commande pour S3
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
      // Métadonnées pour tracking
      Metadata: {
        "original-name": fileName,
        "upload-date": new Date().toISOString(),
        "file-size": fileSize?.toString() || "unknown",
        "uploaded-by": "admin", // Tu peux récupérer l'user ID ici
      },
    });

    // Générer l'URL présignée (valide 2 heures pour laisser du temps aux gros uploads)
    const presignedUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 7200, // 2 heures
    });

    // URL finale du fichier une fois uploadé
    const finalUrl = `${process.env.R2_URL}/${uniqueFileName}`;

    console.log(`✅ Presigned URL generated successfully`);
    console.log(`🔗 Final URL will be: ${finalUrl}`);

    return NextResponse.json({
      presignedUrl,
      finalUrl,
      key: uniqueFileName,
      expiresIn: 7200,
      message: "Presigned URL generated successfully",
    });
  } catch (error) {
    console.error("❌ Presigned URL generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate presigned URL",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
