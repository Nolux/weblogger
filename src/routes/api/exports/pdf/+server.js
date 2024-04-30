import PDFDocument from "pdfkit";
import { db } from "$lib/db.js";
import { error } from "@sveltejs/kit";

export const GET = async ({ locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const localDate = url.searchParams.get("localDate");

  if (!projectId || !localDate) {
    return error(400, "Missing input");
  }

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  const logs = await db.log.findMany({
    where: { projectId, localDateString: localDate, deleted: false },
    orderBy: { timecodeString: "asc" },
  });

  const doc = new PDFDocument({ size: "A4" });
  doc.info.Title = `${localDate}, ${currentProject.name}`;
  doc.info.Author = locals.user.fullName;

  let bottom = doc.page.margins.bottom;
  let pageNumber = 1;
  doc.page.margins.bottom = 0;
  doc
    .fontSize("10")
    .text(pageNumber, 0.5 * (doc.page.width / 2), doc.page.height - 30, {
      width: 250,
      align: "center",
      lineBreak: false,
    });
  doc
    .fontSize("6")
    .text(
      "Generated with Weblogger.io",
      0.5 * (doc.page.width / 2),
      doc.page.height - 15,
      {
        width: 250,
        align: "center",
        lineBreak: false,
      }
    );

  // Reset text writer position

  doc.text("", 50, 50);
  doc.page.margins.bottom = bottom;

  doc.on("pageAdded", () => {
    pageNumber++;
    let bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    doc
      .fontSize("10")
      .text(pageNumber, 0.5 * (doc.page.width / 2), doc.page.height - 30, {
        width: 250,
        align: "center",
        lineBreak: false,
      });
    doc
      .fontSize("6")
      .text(
        "Generated with Weblogger.io",
        0.5 * (doc.page.width / 2),
        doc.page.height - 15,
        {
          width: 250,
          align: "center",
          lineBreak: false,
        }
      );
    // Reset text writer position
    doc.fontSize("14").text("", 50, 50);
    doc.page.margins.bottom = bottom;
  });

  doc
    .fontSize("20")
    .font("Helvetica-Bold")
    .text(`${localDate} - ${currentProject.name}`)
    .text("\n");

  logs.map((log) => {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("TC :")
      .font("Helvetica-Bold")
      .text(log.timecodeString)
      .fontSize(8)
      .font("Helvetica")
      .text("Created by:")
      .font("Helvetica-Bold")
      .text(log.createdByFullName)
      .text("\n")
      .fontSize("12")
      .font("Helvetica")
      .text(log.body)
      .text("\n")
      .text("\n");
  });

  doc.end();

  return new Response(doc, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name}` +
        '.pdf"',
    },
  });
};
