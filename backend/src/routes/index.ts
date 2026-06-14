import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import organizationsRouter from "./organizations";
import beneficiariesRouter from "./beneficiaries";
import donationsRouter from "./donations";
import announcementsRouter from "./announcements";
import notificationsRouter from "./notifications";
import usersRouter from "./users";
import statsRouter from "./stats";
import helpRequestsRouter from "./help_requests";
import registrationRequestsRouter from "./registration_requests";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(organizationsRouter);
router.use(beneficiariesRouter);
router.use(donationsRouter);
router.use(announcementsRouter);
router.use(notificationsRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(helpRequestsRouter);
router.use(registrationRequestsRouter);
router.use(chatRouter);

export default router;
