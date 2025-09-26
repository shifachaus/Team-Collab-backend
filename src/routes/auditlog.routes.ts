import { Router } from "express";
import { getWorkspaceAuditLogs } from "../controllers/auditlog.controller";

const auditlogRoutes = Router();

auditlogRoutes.get("/workspace/:workspaceId", getWorkspaceAuditLogs);

export default auditlogRoutes;
