import { applyBeta } from "@/controllers/v1/beta.controller";
import { validate } from "@/middlewares/validate.middleware";
import { applyBetaSchema } from "@/validations/beta.validation";
import { Router } from "express";

const router = Router();

router.post("/apply", validate(applyBetaSchema), applyBeta);

export default router;
