import { z } from "zod";

export const createComplaintSchema = z.object({
  issueType: z.string().trim().min(1).max(80),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  location: z.object({
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
    text: z.string().trim().min(2).max(300)
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM")
});

export const statusSchema = z.object({
  status: z.string().trim(),
  remarks: z.string().trim().max(1000).optional().default("")
});
