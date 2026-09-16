import { describe, expect, test } from "vitest";

import { parseFormData } from "./formData.js";

describe("parseFormData", () => {
  test("returns the form fields as a plain object", async () => {
    const body = new FormData();
    body.set("email", "USER@example.com");
    body.set("password", "hunter2");

    const request = new Request("http://localhost/login", {
      method: "POST",
      body,
    });

    expect(await parseFormData(request)).toEqual({
      email: "USER@example.com",
      password: "hunter2",
    });
  });

  test("returns an empty object when the body is not form data", async () => {
    const request = new Request("http://localhost/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    });

    expect(await parseFormData(request)).toEqual({});
  });
});
