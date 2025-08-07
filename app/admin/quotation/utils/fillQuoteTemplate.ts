const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

async function generateQuoteDocx(data) {
  const filePath = path.join(process.cwd(), "app", "admin", "quotation", "quote template.docx");
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

module.exports = { generateQuoteDocx };
