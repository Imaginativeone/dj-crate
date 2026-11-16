import { validateOrder } from "./validation";

describe("validateOrder", () => {
  it("accepts a complete order", () => {
    expect(validateOrder({ name: "Doug", email: "doug@example.com", event: "" }, 3)).toEqual({});
  });

  it("reports each problem by field", () => {
    expect(validateOrder({ name: " ", email: "not-an-email", event: "" }, 0)).toEqual({
      name: "Enter your name.",
      email: "Enter an email address like name@example.com.",
      crate: "Your crate is empty.",
    });
  });
});
