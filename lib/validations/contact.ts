import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  channel: z.string().optional().or(z.literal("")),
  subject: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  honeypot: z.string().max(0, "Bot detected").optional().or(z.literal("")), // Must remain empty
});

export type ContactInput = z.infer<typeof contactSchema>;
