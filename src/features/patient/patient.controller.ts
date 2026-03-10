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
import { COMMON_ERROR, PATIENT_ERRORS } from "../../constants/messages";
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
    let data = req.body;
    const user = req.user;
    // Validate input data
    const safeData = PatientConditionSchema.parse(data);
    const payload = {
      ...safeData,
      [`${user?.role.toLowerCase()}Id`]:user?.id
    }
    const patientCondition = await PatientConditionCreate(payload)
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
