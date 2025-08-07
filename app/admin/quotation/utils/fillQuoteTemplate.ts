"use server";

import fs from "fs";
import path from "path";

export async function generateQuoteDocx(data) {
  const PizZip = (await import("pizzip")).default;
  const Docxtemplater = (await import("docxtemplater")).default;

  const filePath = path.join(
    process.cwd(),
    "app",
    "admin",
    "quotation",
    "quote template.docx",
  );
  const content = fs.readFileSync(filePath, "binary");

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.setData(data);
  try {
    doc.render();
  } catch (error) {
    console.error("Error rendering docx template:", error);
    throw error;
  }

  const buffer = doc.getZip().generate({ type: "nodebuffer" });
  return buffer;
}
