import { fail } from "@sveltejs/kit";

import { db } from "$lib/db.js";
import { env } from "$env/dynamic/private";
import jwt from "jsonwebtoken";
import { checkIfAdmin } from "$lib/server/auth.js";

export async function load({ fetch, locals }) {
  const projects = await db.project.findMany({
    include: {
      assignedUsers: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });
  const users = await db.user.findMany({});
  return { projects, users };
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

    return { success: `Project added ${project.name}` };
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

    return { success: `Project deleted ${deletedProject.name}` };
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
    return { success: `${user.email} assigned to ${project.name}` };
  },
  makeRegisterLink: async ({ request, locals, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const { projectId } = formData;

    const jwtUser = {
      issuerId: locals.user.id,
      issuerEmail: locals.user.email,
      projectId: projectId,
    };

    const token = jwt.sign(jwtUser, env.PRIVATE_JWT_USER_SECRET, {
      expiresIn: "1d",
    });

    return {
      registerLink: `${url.origin}/login/register?token=${token}`,
    };
  },
  removeUser: async ({ request, locals, url }) => {
    const formData = Object.fromEntries(await request.formData());

    const { userId } = formData;

    if (!userId) {
      return error(400, "Missing input");
    }

    // Check if admin or owner
    if (!checkIfAdmin(locals)) {
      if (!checkIfOwner(userId, locals)) {
        return error(401, "Missing auth");
      }
    }

    // Get project from db
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    console.log(user);

    // Remove all connections to current projects
    const removeConnectedProjects = await db.user.update({
      where: { id: userId },
      data: {
        assignedProjects: {
          disconnect: [
            ...user.projectIds.map((projectId) => {
              return { id: projectId };
            }),
          ],
        },
      },
    });

    // TODO: remove logs?

    // Finally remove Project
    const deletedUser = await db.user.delete({
      where: { id: userId },
    });

    return {
      success: `User deleted ${deletedUser.fullName}, ${deletedUser.email}`,
    };
  },
};
