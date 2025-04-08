import { error } from "@sveltejs/kit";

import { editColors } from "$lib/helpers/editColors.js";
import { getLogsWithFilters } from "$lib/helpers/getLogsWithFilters.js";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageNumber,
  Footer,
} from "docx";

export const GET = async ({ locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const localDate = url.searchParams.get("localDate");
  let filters = url.searchParams.get("filters");
  const afterTc = url.searchParams.get("afterTc");
  const beforeTc = url.searchParams.get("beforeTc");
  const excludeFilter = url.searchParams.get("excludeFilter");

  if (!projectId || !localDate) {
    return error(400, "Missing input");
  }

  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  const { logs, count } = await getLogsWithFilters({
    projectId,
    localDate,
    filters,
    afterTc,
    beforeTc,
    excludeFilter,
  });

  const textOptions = {
    font: "Calibri",
    size: 24,
  };

  let docChildren = [];

  docChildren.push(
    new Paragraph({
      text: `Logs for ${localDate}`,
      heading: HeadingLevel.HEADING_1,
      break: 2,
      ...textOptions,
    })
  );

  logs.map((log) => {
    let body = log.body.replace(/\n/g, " ");

    let color = false;
    let hex = "#000000";

    if (log.marker) {
      color =
        currentProject.markerColors[
          currentProject.markerColors.findIndex((x) => x.text == log.marker)
        ]?.color;

      hex = editColors[color]?.hex.split("#")[1] || "#000000";
    }

    // Change color based on marker here

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${log.timecodeString}`,
            bold: true,

            ...textOptions,
            size: 30,
          }),

          new TextRun({
            text: `---${log.marker ? log.marker : "NA:"}---`,
            bold: true,
            color: hex,
            ...textOptions,
            size: 30,
          }),
          new TextRun({ text: "", break: 1, ...textOptions }),
          new TextRun({ text: log.body, break: 1, ...textOptions }),
          new TextRun({ text: "", break: 1, ...textOptions }),
          new TextRun({ text: "", break: 1, ...textOptions }),
        ],
      })
    );
  });

  console.log(docChildren);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                size: 20,
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT],
                    break: 1,
                  }),
                  new TextRun({
                    text: "Created with weblogger.io ",
                    break: 1,
                  }),
                ],
              }),
            ],
          }),
        },
      },
    ],
  });

  return await Packer.toBuffer(doc).then((buffer) => {
    return new Response(buffer, {
      headers: {
        "Content-Type": "appication/docx",
        "Content-Disposition":
          'attachment; name="fieldName"; filename="' +
          `${localDate} - ${currentProject.name} - ${count}${
            filters.length > 0 ? " - " + filters.split(",").join(",") : ""
          }${afterTc ? " - " + afterTc.replaceAll(":", "") : ""}` +
          '.docx"',
      },
    });
  });
};
