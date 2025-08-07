// app/api/generate-quote/route.ts
import { NextResponse } from "next/server";
const { generateQuoteDocx } = require("@/app/admin/quotation/utils/fillQuoteTemplate.js");

export async function POST(req: Request) {
  const body = await req.json(); // contains tags like { client, date, products, etc. }

  const docxBuffer = await generateQuoteDocx(body);

  return new NextResponse(docxBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": 'attachment; filename="Quotation.docx"',
    },
  });
}
