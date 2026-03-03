import { z } from "zod";
import { PATIENT_ERRORS } from "../../constants/messages";


export const patientSchema = z.object({
  name: z.string().min(1, { message: PATIENT_ERRORS.NAME_REQUIRED }),

  dateOfBirth: z.coerce
    .date({ message: PATIENT_ERRORS.DOB_INVALID })
    .refine((date) => date < new Date(), {
      message: PATIENT_ERRORS.DOB_FUTURE,
    }),

  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    message: PATIENT_ERRORS.BLOODGROUP_INVALID,
  }),

  gender: z.enum(["MALE","FEMALE","OTHER"], {
    message: PATIENT_ERRORS.GENDER_INVALID,
  }),

  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: PATIENT_ERRORS.MOBILE_INVALID }),
});
export type PatientInput = z.infer<typeof patientSchema>;
