import dotenv from "dotenv";
import { db } from "./src/lib/db.js";

import bcrypt from "bcryptjs";

dotenv.config();

// check if procjet has any

const foundProjects = await db.project.findMany();

console.log(foundProjects);

if (foundProjects.length < 1) {
  const project = await db.project.create({
    data: {
      name: "testproject",
      contact: {
        name: "test",
        email: "test@email.com",
        telephone: "00000000",
      },
    },
  });

  let userData = {
    email: process.env.PRIVATE_ADMIN_USER,
    password: await bcrypt.hash(process.env.PRIVATE_ADMIN_PASSWORD, 10),
    firstName: "Admin",
    lastName: "Admin",
    fullName: "Admin",
    isAdmin: true,
  };

  if (project) {
    userData.assignedProjects = { connect: { id: project.id } };
    userData.selectedProjectId = project.id;
  }

  const user = await db.user.create({
    data: userData,
  });
}
