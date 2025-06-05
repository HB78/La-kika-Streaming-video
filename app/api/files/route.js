// app/api/files/route.js
import { pinata } from "@/app/utils/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - Récupérer la liste des fichiers
export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Paramètres de requête optionnels
    const limit = url.searchParams.get("limit") || "100";
    const offset = url.searchParams.get("offset") || "0";
    const name = url.searchParams.get("name");
    const cid = url.searchParams.get("cid");

    // Options pour la requête Pinata
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    // Ajouter des filtres si fournis
    if (name) {
      options.name = name;
    }
    if (cid) {
      options.cid = cid;
    }

    // Récupérer les fichiers depuis Pinata
    const files = await pinata.listFiles(options);

    // Transformer les données pour une utilisation plus facile
    const transformedFiles = files.rows.map((file) => ({
      id: file.id,
      cid: file.cid,
      name: file.name,
      size: file.size,
      mimeType: file.mime_type,
      numberOfFiles: file.number_of_files,
      createdAt: file.date_pinned,
      groupId: file.group_id,
      keyvalues: file.keyvalues || {},
      regions: file.regions || [],
    }));

    return NextResponse.json({
      success: true,
      files: transformedFiles,
      count: files.count,
      totalCount: files.total_count,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch files",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Rechercher des fichiers avec des critères spécifiques
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      cid,
      limit = 100,
      offset = 0,
      groupId,
      keyvalues,
      mimeType,
    } = body;

    // Construire les options de recherche
    const searchOptions = {
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (name) searchOptions.name = name;
    if (cid) searchOptions.cid = cid;
    if (groupId) searchOptions.group_id = groupId;
    if (mimeType) searchOptions.mime_type = mimeType;
    if (keyvalues) searchOptions.keyvalues = keyvalues;

    // Effectuer la recherche
    const files = await pinata.listFiles(searchOptions);

    // Transformer les données
    const transformedFiles = files.rows.map((file) => ({
      id: file.id,
      cid: file.cid,
      name: file.name,
      size: file.size,
      mimeType: file.mime_type,
      numberOfFiles: file.number_of_files,
      createdAt: file.date_pinned,
      groupId: file.group_id,
      keyvalues: file.keyvalues || {},
      regions: file.regions || [],
    }));

    return NextResponse.json({
      success: true,
      files: transformedFiles,
      count: files.count,
      totalCount: files.total_count,
      searchCriteria: searchOptions,
    });
  } catch (error) {
    console.error("Error searching files:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search files",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
