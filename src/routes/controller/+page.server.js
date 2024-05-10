import { fail } from "@sveltejs/kit";

import { db } from "$lib/db.js";
import { PRIVATE_JWT_USER_SECRET } from "$env/static/private";
import jwt from "jsonwebtoken";

export async function load({ fetch, locals }) {
  const find = locals.user.assignedProjects.findIndex(
    (x) => x.id == locals.user.selectedProjectId
  );

  const currentProject = locals.user.assignedProjects[find];

  const assignedUsers = await db.user.findMany({
    where: {
      projectIds: { has: currentProject.id },
      NOT: { id: locals.user.id },
    },
  });

  return { currentProject, user: locals.user, assignedUsers };
}

export const actions = {
  makeRegisterLink: async ({ request, locals, url }) => {
    const jwtUser = {
      issuerId: locals.user.id,
      issuerEmail: locals.user.email,
      projectId: locals.user.selectedProjectId,
    };

    const token = jwt.sign(jwtUser, PRIVATE_JWT_USER_SECRET, {
      expiresIn: "1d",
    });

    return {
      registerLink: `${url.origin}/login/register?token=${token}`,
    };
  },
  editProject: async ({ request, locals }) => {
    const data = await request.formData();
    const name = data.get("name");
    const contactName = data.get("contactName");
    const contactEmail = data.get("contactEmail");
    const contactTelephone = data.get("contactTelephone");

    console.log(name, contactName, contactEmail, contactTelephone);

    const updatedProject = await db.project.update({
      where: { id: locals.user.selectedProjectId },
      data: {
        name,
        contact: {
          name: contactName,
          email: contactEmail,
          telephone: contactTelephone,
        },
      },
    });

    return { success: "Project saved" };
  },
  editMarkers: async ({ request, locals }) => {
    const data = await request.formData();

    let makerColorsArray = [];

    const markerTexts = data.getAll("markerText");
    console.log(markerTexts);
    const markerColors = data.getAll("markerColor");
    console.log(markerColors);

    markerTexts.map((text, i) => {
      makerColorsArray.push({ text: text, color: markerColors[i] });
    });

    const updatedProject = await db.project.update({
      where: { id: locals.user.selectedProjectId },
      data: { markerColors: makerColorsArray },
    });
    return { success: "Markers saved" };
  },
  assignUser: async ({ request, locals }) => {
    const formData = Object.fromEntries(await request.formData());

    const { email } = formData;
    console.log(email);

    const lowerCaseEmail = email.toLowerCase();

    const user = await db.user.findUnique({ where: { email: lowerCaseEmail } });

    if (!user) {
      return fail(400, { error: true, errorMsg: "No user found" });
    }

    const project = await db.project.update({
      where: { id: locals.user.selectedProjectId },
      data: { assignedUsers: { connect: { id: user.id } } },
    });

    return { success: `${user.email} assigned` };
  },
  unassignUser: async ({ request, locals }) => {
    const data = await request.formData();

    const userEmail = data.get("email");
    console.log(userEmail);

    const user = await db.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      return fail(400, { error: true, errorMsg: "No user found" });
    }

    const project = await db.project.update({
      where: { id: locals.user.selectedProjectId },
      data: { assignedUsers: { disconnect: { id: user.id } } },
    });

    return { success: `${user.email} unassigned` };
  },
};
