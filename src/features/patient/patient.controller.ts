import express from "express";
import { patientSchema, type PatientInput } from "./patient.schema";
import { CreatePatient } from "./patient.service";
const patientRouter = express.Router();

patientRouter.post("/create", async (req, res ,next) => {
  const data: PatientInput = req.body;
  try {
    const safeData = patientSchema.parse(data);
   const patient = await CreatePatient(safeData)
   res.status(200).json({
    success: true,
    data: patient
   })
} catch (error) {
    next(error)
  }
});

export default patientRouter;


