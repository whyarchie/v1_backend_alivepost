import express from "express";
import { AuthUser } from "../../middleware/Auth";
import {
  createDoctorSchema,
  searchDoctorSchema,
  getDoctorParamSchema,
  listDoctorsByHospitalSchema,
} from "./doctor.schema";
import {
  createDoctorService,
  listDoctorsByHospitalService,
  searchDoctorsService,
  getDoctorByIdService,
} from "./doctor.service";
import { AppError } from "../../utils/AppError";
import { COMMON_ERROR } from "../../constants/messages";

const DoctorRouter = express.Router();

/**
 * POST /api/v1/doctor/signup
 * Create a new doctor
 */
DoctorRouter.post("/signup", AuthUser, async (req, res, next) => {
  try {
    const { name, username } = req.body;
    const hospitalId = req.user?.id as number;

    // Validate request body
    const safeData = createDoctorSchema.parse({
      name,
      username,
    });

    // Call service
    const doctor = await createDoctorService(
      safeData.name,
      safeData.username,
      hospitalId,
    );

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
});
/**
 * GET /api/v1/doctor/hospital/:hospitalId
 * List all doctors by hospital ID
 */
DoctorRouter.get("/hospital/:hospitalId", AuthUser, async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const authHospitalId = req.user?.id as number;

    // Validate param
    const safeId = listDoctorsByHospitalSchema.parse({
      hospitalId,
    });

    // Authorization check - can only view doctors from their own hospital
    if (safeId.hospitalId !== authHospitalId) {
      throw new AppError(
        "You are not authorized to view doctors from another hospital",
        403,
      );
    }

    const doctors = await listDoctorsByHospitalService(safeId.hospitalId);

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
});
/**
 * GET /api/v1/doctor/search?query=xyz
 * Search doctors by username or name
 */
DoctorRouter.get("/search", AuthUser, async (req, res, next) => {
  try {
    const { query } = req.query;
    const hospitalId = req.user?.id as number;

    if (!query || typeof query !== "string") {
      throw new AppError("Search query is required", 400);
    }

    // Validate query param
    const safeData = searchDoctorSchema.parse({
      query,
    });

    // Call service
    const doctors = await searchDoctorsService(safeData.query, hospitalId);

    res.status(200).json({
      success: true,
      message: "Search results retrieved successfully",
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
});
/**
 * GET /api/v1/doctor/:id
 * Get individual doctor by ID
 */
DoctorRouter.get("/:id", AuthUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user?.id as number;

    if (!id) {
      throw new AppError("Doctor ID is required", 400);
    }

    // Validate param
    const safeId = getDoctorParamSchema.parse({
      id,
    });

    // Call service
    const doctor = await getDoctorByIdService(safeId.id, hospitalId);

    res.status(200).json({
      success: true,
      message: "Doctor information retrieved successfully",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
});

export default DoctorRouter;
