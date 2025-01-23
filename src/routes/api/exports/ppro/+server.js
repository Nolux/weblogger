import builder from "xmlbuilder";
import { error } from "@sveltejs/kit";

import { editColors } from "$lib/helpers/editColors.js";
import { getLogsWithFilters } from "$lib/helpers/getLogsWithFilters.js";

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

  let xmlObj = {
    xmeml: {
      "@version": "4",
      sequence: {
        rate: { timebase: { "#text": "25" }, ntsc: { "#text": "FALSE" } },
        name: { "#text": `${localDate} - ${currentProject.name}` },
        media: {
          video: {
            format: {
              samplecharacteristics: {
                rate: {
                  timebase: { "#text": "25" },
                  ntsc: { "#text": "FALSE" },
                },
                width: { "#text": "1920" },
                height: { "#text": "1080" },
              },
            },
            track: {
              clipitem: {
                "@id": "clipitem-1",
                masterclipid: { "#text": "masterclip-1" },
                name: { "#text": "Black Video" },
                enabled: { "#text": "TRUE" },
                duration: { "#text": "108000" },
                rate: {
                  timebase: { "#text": "25" },
                  ntsc: { "#text": "FALSE" },
                },
                start: { "#text": "2154750" },
                end: { "#text": "2160000" },
                in: { "#text": "1074750" },
                out: { "#text": "1080000" },
                pproTicksIn: { "#text": "10920147840000000" },
                pproTicksOut: { "#text": "10973491200000000" },
                alphatype: { "#text": "none" },
                file: {
                  "@id": "file-1",
                  name: { "#text": "Black Video" },
                  mediaSource: { "#text": "Slug" },
                  rate: {
                    timebase: { "#text": "25" },
                    ntsc: { "#text": "FALSE" },
                  },
                  timecode: {
                    rate: {
                      timebase: { "#text": "25" },
                      ntsc: { "#text": "FALSE" },
                    },
                    string: { "#text": "00;00;00;00" },
                    frame: { "#text": "0" },
                    displayformat: { "#text": "DF" },
                  },
                },
              },
            },
          },
        },
        timecode: {
          rate: { timebase: { "#text": "25" }, ntsc: { "#text": "FALSE" } },
        },
        marker: [],
      },
    },
  };

  logs.map((log) => {
    let body = log.body.replace(/\n/g, " ");
    //body = body.replace(/[^a-zA-Z0-9!@#$%^&*: ]/g, "");

    let markerInFrames =
      log.timecode.hours * 60 * 60 * 25 +
      log.timecode.minutes * 60 * 25 +
      log.timecode.seconds * 25 +
      log.timecode.frames;

    let color = false;
    let pproColor = " ";

    if (log.marker) {
      color =
        currentProject.markerColors[
          currentProject.markerColors.findIndex((x) => x.text == log.marker)
        ]?.color;

      pproColor = editColors[color]?.ppro || " ";
    }

    // Change color based on marker here

    xmlObj.xmeml.sequence["marker"].push({
      comment: { "#text": log.body },
      name: { "#text": log.marker ? log.marker : "A:" },
      in: { "#text": markerInFrames },
      out: { "#text": markerInFrames },
      pproColor: { "#text": pproColor },
    });
  });

  // Build final XML

  var root = builder.create(xmlObj, {
    encoding: "utf-8",
    version: "1.0",
  });

  let xml = root.end({ pretty: true });

  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml",
      "Content-Disposition":
        'attachment; name="fieldName"; filename="' +
        `${localDate} - ${currentProject.name} - ${count}${
          filters.length > 0 ? " - " + filters.split(",").join(",") : ""
        }${afterTc ? " - " + afterTc.replaceAll(":", "") : ""}` +
        '.xml"',
    },
  });
};
