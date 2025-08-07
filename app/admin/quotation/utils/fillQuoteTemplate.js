import fs from "fs"
import path from "path"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"

export async function generateQuoteDocx(data: any): Promise<Buffer> {
  const templatePath = path.resolve(process.cwd(), "app/admin/quotation/quote template.docx")
  const content = fs.readFileSync(templatePath, "binary")
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  // Fill values
  doc.setData({
    client: data.client || "Client Name",
    date: data.date || new Date().toLocaleDateString(),
    transport: data.transport || 0,
    total: data.total || 0,
    sr: data.sr || [], // array of line items
  })

  try {
    doc.render()
  } catch (error) {
    console.error("Error rendering DOCX template:", error)
    throw error
  }

  const buffer = doc.getZip().generate({ type: "nodebuffer" })
  return buffer
}
