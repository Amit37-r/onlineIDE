
import { Router } from "express";
import { AuthController } from "../controller/Auth/AuthController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const authController = new AuthController();

router.post('/auth/register', (req, res, next) =>
    authController.register(req, res, next)
);

router.post('/auth/login', (req, res, next) =>
    authController.login(req, res, next)
);

router.post('/auth/logout', (req, res, next) =>
    authController.logout(req, res, next)
);

router.get('/me', AuthMiddleware, (req, res, next) =>
    authController.getMe(req, res, next)
);

export default router;
 