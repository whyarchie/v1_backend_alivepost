import express, { type NextFunction } from "express";
import {
  medicalHistorySchema,
  PatientConditionSchema,
  patientLoginSchema,
  patientSchema,
  type MedicalHistoryCreate,
  type PatientInput,
  type PatientLoginInput,
} from "./patient.schema";
import {
  CreatePatient,
  DeletePatientService,
  LoginPatient,
  MedicalHistoryCreateService,
  PatientConditionCreate,
} from "./patient.service";
import { AuthUser } from "../../middleware/Auth";
const patientRouter = express.Router();

patientRouter.post("/create", async (req, res, next) => {
  const data: PatientInput = req.body;
  try {
    const safeData = patientSchema.parse(data);
    const patient = await CreatePatient(safeData);
    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
});
patientRouter.post("/login", async (req, res, next) => {
  const data: PatientLoginInput = req.body;
  try {
    const safeData = patientLoginSchema.parse(data);
    const patient = await LoginPatient(safeData);
    res.status(200).cookie("token", patient.token).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
});

//Patient Delete
patientRouter.delete("/delete", AuthUser, async (req, res, next) => {
  try {
    const userInfo = req.user;
    if (userInfo?.role == "Patient") {
      const id = userInfo?.id;
      const data = await DeletePatientService(id);
      console.log(data);
      res.status(200).json({
        success: true,
        data: data,
      });
    }
  } catch (error) {
    next(error);
  }
});
//Medical History create
patientRouter.post("/medicalhistorycreate", async (req, res, next) => {
  const data: MedicalHistoryCreate = req.body;
  try {
    const safeData = medicalHistorySchema.parse(data);
    const newData = await MedicalHistoryCreateService(safeData);
    res.status(200).json({
      success: true,
      data: newData,
    });
  } catch (error) {
    next(error);
  }
});

//Create Patient Condition
patientRouter.post("/condition", AuthUser, async (req, res, next) => {
  try {
    const data = req.body;
    const user = req.user;

    // Validate input data
    const safeData = PatientConditionSchema.parse(data);

    // Determine patient ID based on user role
    let patientId: number | null = null;
    if (user?.role === "Patient") {
      patientId = user.id;
    } else if (user?.role === "Hospital" || user?.role === "Doctor") {
      patientId = safeData.patientId;
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Invalid user role",
      });
    }

    // Ensure patientId is valid
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    // Create patient condition
    const patientCondition = await PatientConditionCreate({
      id: patientId,
      data: safeData, // Pass safeData as `data` instead of `safeData`
    });

    // Success response
    res.status(201).json({
      success: true,
      data: patientCondition,
    });
  } catch (error) {
    next(error);
  }
});

export default patientRouter;
