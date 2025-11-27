// src/feature/upload/api/apiUploadFile.ts
import { NextResponse } from "next/server";
import formidable, { File as FormidableFile } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export async function POST(req: Request) {
  try {
    // Extract raw body (as buffer)
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a mock IncomingMessage-like object for formidable
    const mockReq = Object.assign(Readable.from(buffer), {
      headers: Object.fromEntries(req.headers),
      method: req.method,
      url: req.url,
    });

    const form = formidable({
      multiples: true,
      uploadDir,
      keepExtensions: true,
    });

    const filesData = await new Promise((resolve, reject) => {
      form.parse(mockReq as any, (err, fields, files) => {
        if (err) {
          console.error("Upload error:", err);
          reject(err);
          return;
        }

        const fileArr: any[] = [];
        const pushFile = (f: FormidableFile) => {
          const relPath = `/uploads/${path.basename(f.filepath)}`;
          fileArr.push({
            name: f.originalFilename,
            url: relPath,
            size: f.size,
            mimeType: f.mimetype,
          });
        };

        if (Array.isArray(files.file)) {
          (files.file as FormidableFile[]).forEach(pushFile);
        } else if (files.file) {
          pushFile(files.file as FormidableFile);
        }

        resolve(fileArr);
      });
    });

    return NextResponse.json({ files: filesData });
  } catch (err) {
    console.error("Error handling upload:", err);
    return NextResponse.json(
      { error: "Upload failed", details: String(err) },
      { status: 500 }
    );
  }
}
