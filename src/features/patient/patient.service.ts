import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import type {
  MedicalHistoryCreate,
  PatientInput,
  PatientLoginInput,
} from "./patient.schema";
import { COMMON_ERROR, error, PATIENT_ERRORS } from "../../constants/messages";
import { AppError } from "../../utils/AppError";

export async function CreatePatient(data: PatientInput) {
  const patient = await prisma.patient.upsert({
    where: { mobileNumber: data.mobileNumber },
    update: {},
    create: {
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth), // ensure it's a Date object
      bloodGroup: data.bloodGroup,
      gender: data.gender,
      mobileNumber: data.mobileNumber,
    },
  });
  return patient;
}

//Login patient using mobile number and dateofBirth
export async function LoginPatient(data: PatientLoginInput) {
  const patient = await prisma.patient.findUnique({
    where: { mobileNumber: data.mobileNumber },
  });
  if (!patient) {
    throw new AppError(error.INVALID_CREDENTIALS, 401);
  }
  if (patient.dateOfBirth.toISOString() !== data.dateOfBirth.toISOString()) {
    throw new AppError(error.INVALID_CREDENTIALS, 401);
  }
  const token = jwt.sign({ id: patient.id ,role: "Patient" }, process.env.JWT_SECRET!, {
    expiresIn: "14d",
  });
  return { patient, token };
}

//Medical history create for patient
export async function MedicalHistoryCreateService(data: MedicalHistoryCreate) {
  try {
    return await prisma.medicalHistory.create({
      data: {
        diseaseId: data.diseaseId,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        patientId: data.patientId,
      },
    });
  } catch (error: any) {
    if (error.code === "P2003") {
      const field = error.meta?.field_name;

      if (field?.includes("patientId")) {
        throw new AppError(PATIENT_ERRORS.INVALID_PATIENT, 404);
      }

      if (field?.includes("diseaseId")) {
        throw new AppError(COMMON_ERROR.INVALID_DISEASE, 404);
      }
    }

    throw error;
  }
}
