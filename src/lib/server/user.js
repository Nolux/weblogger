import { PRIVATE_JWT_ACCESS_SECRET } from "$env/static/private";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { db } from "$lib/db.js";

export const createUser = async (email, password, firstName, lastName) => {
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

  try {
    const user = await db.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        fullName: firstName + " " + lastName,
      },
    });

    return { user };
  } catch (error) {
    return {
      error: "Something went wrong",
    };
  }
};

export const loginUser = async (email, password) => {
  console.log(PRIVATE_JWT_ACCESS_SECRET);
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

  const token = jwt.sign(jwtUser, PRIVATE_JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });

  return { token };
};
