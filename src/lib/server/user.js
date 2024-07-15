import { env } from "$env/dynamic/private";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { db } from "$lib/db.js";

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
    return {
      error: "Something went wrong",
    };
  }
};

export const loginUser = async (email, password) => {
  email = email.toLowerCase();
  // Check if user exists
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      error: "Invalid credentials",
    };
  }

  // Verify the password
  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    return {
      error: "Invalid credentials",
    };
  }

  const jwtUser = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(jwtUser, env.PRIVATE_JWT_ACCESS_SECRET, {
    expiresIn: "30d",
  });

  return { token };
};
