import { fail } from "@sveltejs/kit";

import { db } from "$lib/db.js";
import { PRIVATE_JWT_ACCESS_SECRET } from "$env/static/private";
import jwt from "jsonwebtoken";

export async function load({ fetch, locals }) {
  const projects = await db.project.findMany({
    include: {
      assignedUsers: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });
  return { projects };
}
export const actions = {
  addProject: async ({ request, locals, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const { name, contactName, contactEmail, contactTelephone } = formData;

    const project = await db.project.create({
      data: {
        name: name,
        contact: {
          name: contactName,
          email: contactEmail,
          telephone: contactTelephone,
        },
      },
    });

    return { sucess: true };
  },
  deleteProject: async ({ request, locals, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const { projectId } = formData;

    // Get project from db
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    // Remove all connections to current users
    const removeConnectedUsers = await db.project.update({
      where: { id: projectId },
      data: {
        assignedUsers: {
          disconnect: [
            ...project.userIds.map((userId) => {
              return { id: userId };
            }),
          ],
        },
      },
    });

    // Remove logs
    const removeLogs = await db.log.deleteMany({
      where: { projectId: projectId },
    });

    // Finally remove Project
    const deletedProject = await db.project.delete({
      where: { id: projectId },
    });
  },
  assignUserToProject: async ({ request, locals, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const { email, projectId } = formData;

    console.log(email, projectId);

    const lowercaseEmail = email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email: lowercaseEmail },
    });

    if (!user) {
      return fail(400, { error: true, errorMsg: "User does not exist" });
    }

    const project = await db.project.update({
      where: { id: projectId },
      data: { assignedUsers: { connect: { id: user.id } } },
    });
  },
  makeRegisterLink: async ({ request, locals, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const { projectId } = formData;

    const jwtUser = {
      issuerId: locals.user.id,
      issuerEmail: locals.user.email,
      projectId: projectId,
    };

    const token = jwt.sign(jwtUser, PRIVATE_JWT_ACCESS_SECRET, {
      expiresIn: "1d",
    });

    return {
      registerLink: `${url.origin}/login/register?token=${token}`,
    };
  },
};
