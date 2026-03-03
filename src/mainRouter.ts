import express from "express"
import patientRouter from "./features/patient/patient.controller"
const mainRouter = express.Router()

mainRouter.use('/patient', patientRouter)
export default mainRouter