import { z } from "zod";

// Create Doctor Schema
export const createDoctorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .trim(),
});

export type CreateDoctorRequest = z.infer<typeof createDoctorSchema>;

// Search Doctor Schema
export const searchDoctorSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must be at most 100 characters")
    .trim(),
});

export type SearchDoctorRequest = z.infer<typeof searchDoctorSchema>;

// Doctor ID Param Schema
export const getDoctorParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Doctor ID must be a valid number")
    .transform(Number),
});

export type GetDoctorParam = z.infer<typeof getDoctorParamSchema>;

// Hospital ID Param Schema
export const listDoctorsByHospitalSchema = z.object({
  hospitalId: z
    .string()
    .regex(/^\d+$/, "Hospital ID must be a valid number")
    .transform(Number),
});

export type ListDoctorsByHospitalParam = z.infer<
  typeof listDoctorsByHospitalSchema
>;
