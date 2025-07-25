// app/api/s3-upload/route.js
import { uploadFileToS3 } from "@/app/utils/aws-s3-config";
import { isAdmin } from "@/lib/dryApiFunction/isAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("🚀 API /s3-upload called");
  // Vérification si l'utilisateur est admin
  const adminCheck = await isAdmin();

  // Vérifier si c'est une erreur
  if (adminCheck.status !== 200) {
    return adminCheck; // Retourner directement l'erreur
  }
  try {
    const data = await req.formData();
    const file = data.get("file");
    const prefix = data.get("prefix") || "uploads";
    const fileName = data.get("fileName") || undefined;

    console.log("📁 File received:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      prefix,
    });

    // Validation
    if (!file) {
      console.error("❌ No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      console.error("❌ Empty file");
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    console.log("📤 Starting upload to S3...");
    const url = await uploadFileToS3(file, fileName, prefix);

    console.log("✅ Upload successful:", url);

    // ✅ CORRECTION: Retourner correctement la réponse
    return NextResponse.json(
      {
        url,
        message: "File uploaded successfully",
        filename: file.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Upload error:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: error.message || "Upload failed",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
