import { Request, Response, Router } from "express";

const healthRouter = Router();

healthRouter.get("/health", (req: Request, res: Response): void => {
  res.status(201).json({
    message: `The API is working Fine`,
    time: new Date().toDateString(),
  });
});

export { healthRouter };
