import prisma from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { COMMON_ERROR } from "../../constants/messages";

// Create Doctor Service
export const createDoctorService = async (
  name: string,
  username: string,
  hospitalId: number,
) => {
  // Check if hospital exists
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) {
    throw new AppError(COMMON_ERROR.INVALID_HOSPITAL, 400);
  }

  // Check if username already exists
  const existingDoctor = await prisma.doctor.findUnique({
    where: { username },
  });

  if (existingDoctor) {
    throw new AppError("Username already exists", 409);
  }

  // Create doctor
  const doctor = await prisma.doctor.create({
    data: {
      name,
      username,
      hospitalId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      hospitalId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return doctor;
};

// List Doctors by Hospital ID Service
export const listDoctorsByHospitalService = async (hospitalId: number) => {
  // Verify hospital exists
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) {
    throw new AppError(COMMON_ERROR.INVALID_HOSPITAL, 400);
  }

  const doctors = await prisma.doctor.findMany({
    where: {
      hospitalId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      hospitalId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return doctors;
};

// Search Doctors Service
export const searchDoctorsService = async (
  query: string,
  hospitalId: number,
) => {
  // Verify hospital exists
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) {
    throw new AppError(COMMON_ERROR.INVALID_HOSPITAL, 400);
  }

  const doctors = await prisma.doctor.findMany({
    where: {
      hospitalId,
      OR: [
        {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      hospitalId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return doctors;
};
// Get Doctor by ID Service (with Hospital Auth Check)
export const getDoctorByIdService = async (
  doctorId: number,
  hospitalId: number,
) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      name: true,
      username: true,
      hospitalId: true,
      createdAt: true,
      updatedAt: true,
      patientConditions: {
        select: {
          id: true,
          patientId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!doctor) {
    throw new AppError(COMMON_ERROR.INVALID_DOCTOR, 404);
  }

  // Hospital auth check - only show doctor if they belong to this hospital
  if (doctor.hospitalId !== hospitalId) {
    throw new AppError("You are not authorized to view this doctor", 403);
  }

  return doctor;
};
