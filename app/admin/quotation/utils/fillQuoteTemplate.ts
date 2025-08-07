import fs from "fs";
import path from "path";
import { Packer, Document, Paragraph, TextRun } from "docx";
import { loadSync } from "docx-templates";

export async function generateQuoteDocx(data: any): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), "app/admin/quotation/quote template.docx");

  const template = fs.readFileSync(templatePath);
  const buffer = await loadSync({
    template,
    tags: data,
  });

  return buffer;
}
