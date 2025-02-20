import { z } from "zod";

export const signUpSchemaValidation = z.object({
  userName: z
    .string({ required_error: "userName is required" })
    .trim()
    .min(4, { message: "username must be at least 4 character" })
    .max(50, { message: "userName must not be more than 50 letters" }),

  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email({ message: "invalid email address" })
    .min(4, { message: "email must be at least 4 character" })
    .max(250, { message: "email must not be more than 50 letters" }),

  fullName: z
    .string({ required_error: "fullName is required" })
    .trim()
    .min(4, { message: "fullName must be at least 4 character" })
    .max(50, { message: "fullName must not be more than 50 letters" }),

  password: z
    .string({ required_error: "password is required" })
    .min(6, { message: "password must be at least 6 character" })
    .max(50, { message: "password must not be more than 50 letters" }),
});
//added
