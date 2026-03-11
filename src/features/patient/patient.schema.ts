import { z } from "zod";
import { COMMON_ERROR, PATIENT_ERRORS } from "../../constants/messages";

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

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: PATIENT_ERRORS.GENDER_INVALID,
  }),

  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: PATIENT_ERRORS.MOBILE_INVALID }),
});

export const patientLoginSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: PATIENT_ERRORS.MOBILE_INVALID }),
  dateOfBirth: z.coerce
    .date({ message: PATIENT_ERRORS.DOB_INVALID })
    .refine((date) => date < new Date(), {
      message: PATIENT_ERRORS.DOB_FUTURE,
    }),
});

// Medical History

export const medicalHistorySchema = z
  .object({
    diseaseId: z
      .number({ message: PATIENT_ERRORS.DISEASE_ID_REQUIRE })
      .int()
      .positive(),

    patientId: z
      .number({ message: PATIENT_ERRORS.PATIENT_ID_REQUIRE })
      .int()
      .positive(),

    description: z
      .string()
      .trim()
      .max(1500, { message: COMMON_ERROR.DESCRIPTION_TOO_LONG })
      .optional(),

    startDate: z.coerce.date({ message: COMMON_ERROR.STARTDATE_REQUIRE }),

    endDate: z.coerce.date().optional(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: COMMON_ERROR.ENDDATE_BEFORE_START,
    path: ["endDate"],
  });

//PatientConditionSchema
export const PatientConditionSchema = z
  .object({
    patientId: z
      .number()
      .int()
      .positive({ message: PATIENT_ERRORS.INVALID_PATIENT }),

    diseaseId: z
      .number()
      .int()
      .positive({ message: COMMON_ERROR.INVALID_DISEASE }),
    hospitalId: z
      .number()
      .int()
      .positive({ message: COMMON_ERROR.INVALID_HOSPITAL }),
    doctorId: z
      .number()
      .int()
      .positive({ message: COMMON_ERROR.INVALID_DOCTOR })
      .optional(),
    status: z.enum(["STABLE", "CRITICAL", "RECOVERED"]),

    startDate: z.coerce.date({
      message: COMMON_ERROR.STARTDATE_REQUIRE,
    }),

    endDate: z.coerce.date().optional(),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: COMMON_ERROR.ENDDATE_BEFORE_START,
    path: ["endDate"],
  });
export type PatientLoginInput = z.infer<typeof patientLoginSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type MedicalHistoryCreate = z.infer<typeof medicalHistorySchema>;
export type PatientConditionInput = z.infer<typeof PatientConditionSchema>;
