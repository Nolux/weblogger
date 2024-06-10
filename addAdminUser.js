import dotenv from "dotenv";
import { db } from "./src/lib/db.js";

import bcrypt from "bcryptjs";

export const createUser = async (
  email,
  password,
  firstName,
  lastName,
  projectId
) => {
  email = email.toLowerCase();
  // Check if user exists
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return {
      error: "User already exists",
    };
  }

  firstName = firstName.toLowerCase();
  firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  lastName = lastName.toLowerCase();
  lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

  let userData = {
    email,
    password: await bcrypt.hash(password, 10),
    firstName,
    lastName,
    fullName: firstName + " " + lastName,
  };

  if (projectId) {
    userData.assignedProjects = { connect: { id: projectId } };
    userData.selectedProjectId = projectId;
  }

  try {
    const user = await db.user.create({
      data: userData,
    });

    return { user };
  } catch (error) {
    console.log(error);
    return {
      errors: "Something went wrong",
    };
  }
};

dotenv.config();

createUser(
  process.env.PRIVATE_ADMIN_USER,
  process.env.PRIVATE_ADMIN_PASSWORD,
  "Admin",
  "admin"
);

console.log(process.env.PRIVATE_ADMIN_USER);
