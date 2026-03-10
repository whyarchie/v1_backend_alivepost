import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import type {
  MedicalHistoryCreate,
  PatientConditionInput,
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
  const token = jwt.sign(
    { id: patient.id, role: "Patient" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "30d",
    },
  );
  return { patient, token };
}

//Delete Patient service

export async function DeletePatientService(id: number | undefined) {
  if (!id) {
    throw new AppError(COMMON_ERROR.ID_NOT_FOUND, 404);
  }
  try {
    const patient = await prisma.patient.delete({
      where: {
        id: id,
      },
    });

    return patient;
  } catch (error: any) {
    // Record not found
    if (error.code === "P2025") {
      throw new AppError(PATIENT_ERRORS.INVALID_PATIENT, 404);
    }

    // Foreign key constraint
    if (error.code === "P2003") {
      throw new AppError(COMMON_ERROR.FOREIGN_KEY_CONSTRAINT, 400);
    }

    throw error; // unknown error
  }
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
export async function PatientConditionCreate(data: PatientConditionInput) {
  try {
    const patientCondition = await prisma.patientCondition.create({
      data: {
        patientId: data.patientId,
        hospitalId: data.hospitalId,
        doctorId: data.doctorId,
        diseaseId: data.diseaseId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
    });
    return patientCondition;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as {
        code?: string;
        meta?: { field_name?: string };
      };

      if (prismaError.code === "P2003") {
        const field = prismaError.meta?.field_name;

        if (field?.includes("patientId")) {
          throw new AppError(PATIENT_ERRORS.INVALID_PATIENT, 404);
        }

        if (field?.includes("diseaseId")) {
          throw new AppError(COMMON_ERROR.INVALID_DISEASE, 404);
        }

        if (field?.includes("doctorId")) {
          throw new AppError(COMMON_ERROR.INVALID_DOCTOR, 404);
        }

        if (field?.includes("hospitalId")) {
          throw new AppError(COMMON_ERROR.INVALID_HOSPITAL, 404);
        }
      }

      throw new AppError(
        "Database error while creating patient condition",
        500,
      );
    }

    throw error;
  }
}
