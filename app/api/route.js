import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  return new NextResponse("bienvenu sur la kika", {
    status: 200,
    message: "serie and movie api",
  });
};
