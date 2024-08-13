import PdfPrinter from "pdfmake";
import dayjs from "dayjs";

import { error } from "@sveltejs/kit";
import { editColors } from "$lib/helpers/editColors.js";
import { getLogsWithFilters } from "$lib/helpers/getLogsWithFilters.js";

export const GET = async ({ locals, url }) => {
  const projectId = locals.user.selectedProjectId;
  const localDate = url.searchParams.get("localDate");
  let filters = url.searchParams.get("filters");
  const afterTc = url.searchParams.get("afterTc");

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
  });

  logs.map((log) => {
    if (log.marker) {
      log.markerColor = "";

      let foundColor =
        currentProject.markerColors[
          currentProject.markerColors.findIndex((x) => x.text == log.marker)
        ];
      if (foundColor) {
        log.markerColor = editColors[foundColor.color].hex;
        log.markerTextColor = editColors[foundColor.color].textHex;
      }
    }
  });

  // Define font files
  let fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);
  let content = [];

  content.push({
    text: `Logs for: ${localDate}`,
    fontSize: 16,
    bold: true,
    lineHeight: 2,
  });

  content.push(
    logs.map((log) => {
      let returnArray = [];

      const tagsArray = log.tags.map((tag) => {
        return {
          text: " " + tag + " " + "\n",
          color: tag.includes(":") ? log.markerTextColor : "black",
          background: tag.includes(":") ? log.markerColor : "white",
          lineHeight: 1,
          bold: true,
        };
      });

      returnArray.push({
        stack: [
          {
            unbreakable: true,
            columns: [
              {
                width: "33%",
                text: [
                  { text: "TIMECODE: \n", fontSize: 8 },
                  { text: log.timecodeString, bold: true },
                ],
              },
              {
                width: "33%",
                alignment: "center",
                text: tagsArray,
              },
              {
                width: "33%",
                text: `${log.createdByFullName}\n${dayjs(log.createdAt).format(
                  "YYYY.MM.DD HH:MM"
                )}`,
                alignment: "right",
                fontSize: 6,
              },
            ],
          },
          { text: " ", lineHeight: 2 },
          { text: log.body },
          { text: " ", lineHeight: 4 },
        ],
        headlineLevel: 1,
      });

      return returnArray;
    })
  );

  let docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 40],
    info: {
      title: `${localDate} - ${currentProject.name}`,
      author: locals.user.fullName,
    },
    content,
    footer: (currentPage, pageCount, pageSize) => {
      return [
        {
          text: currentPage + "/" + pageCount,
          alignment: "center",
          fontSize: 12,
          lineHeight: 1,
        },

        {
          text: "Made with Weblogger.io",
          fontSize: "5",
          alignment: "center",
          lineHeight: 1,
        },
      ];
    },
    pageBreakBefore: function (
      currentNode,
      followingNodesOnPage,
      nodesOnNextPage,
      previousNodesOnPage
    ) {
      return (
        currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0
      );
    },
    defaultStyle: {
      font: "Helvetica",
      lineHeight: 1.5,
    },
  };

  let options = {
    font: "Helvetica",
  };

  let pdfDoc = printer.createPdfKitDocument(docDefinition, options);
  pdfDoc.end();

  return new Response(pdfDoc, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name}${
          filters.length > 0 ? " - " + filters.split(",").join(",") : ""
        }${afterTc ? " - " + afterTc.replaceAll(":", "") : ""}` +
        '.pdf"',
    },
  });
};
