import express from "express";
import { diseaseSchema, type DiseaseCreateSchema } from "./disease.schema";
import { CreateDisease, DiseaseDataByIdService, DiseaseSearchService } from "./disease.service";

const diseaseRouter = express.Router();

diseaseRouter.post("/create", async (req, res, next) => {
  try {
    const data: DiseaseCreateSchema = req.body;
    const safeData = diseaseSchema.parse(data);
    const diseaseData = await CreateDisease(safeData);
    res.status(201).json({
      success: true,
      data: diseaseData,
    });
  } catch (error) {
    next(error);
  }
});
diseaseRouter.get("/search", async (req, res, next) => {
  try {
    const value = req.query.value as string;
    const output =await DiseaseSearchService(value);
    res.status(200).json({
      success: true,
      data: output,
    });
  } catch (error) {
    next(error);
  }
});
diseaseRouter.get("/",async (req , res , next)=>{
  try{
      const StringId = req.query.id as string
      const id = parseInt(StringId)
      const data = await DiseaseDataByIdService(id)
      res.status(200).json({
        success: true,
        data: data
      })
  }catch(error){
    next(error)
  }
})
export default diseaseRouter;
