import { redirect, fail } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

import { db } from "$lib/db.js";
import { env } from "$env/dynamic/private";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: env.PRIVATE_MAILUSER,
    pass: env.PRIVATE_MAILPASSWORD,
  },
  from: env.PRIVATE_MAILUSER,
});

export const actions = {
  default: async ({ request, url }) => {
    const formData = Object.fromEntries(await request.formData());

    if (!formData.email) {
      return fail(400, {
        error: "Missing email",
      });
    }

    let { email } = formData;

    email = email.toLowerCase();

    const user = await db.user.findUnique({ where: { email: email } });

    if (!user) {
      return { success: true };
    }

    const jwtUser = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(jwtUser, env.PRIVATE_JWT_RESET_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${url.origin}/login/forgot/${token}`;

    let info = await transporter.sendMail({
      from: '"Weblogger.io" <weblogger.io@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Reset your password for Weblogger.io", // Subject line0
      text: ``, // plain text body
      html: `
        <body>
          <p>
            Reset your password here: <br />
            <a href=${resetLink}>Reset link</a>
          </p>
        </body>
      `, // html body
    });
    console.log(`Reset mail sent`);

    return { success: true };
  },
};
