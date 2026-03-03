import { prisma } from "../../config/prisma";
import type { PatientInput } from "./patient.schema";

export async function CreatePatient(data: PatientInput) {
  const patient = await prisma.patient.upsert({
    where: { mobileNumber: data.mobileNumber },
    update: {},
    create: {
      name:         data.name,
      dateOfBirth:  new Date(data.dateOfBirth),  // ensure it's a Date object
      bloodGroup:   data.bloodGroup,
      gender:       data.gender,
      mobileNumber: data.mobileNumber,
    },
  });
  return patient;
}