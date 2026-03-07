import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export enum Permission {
  VIEW_PATIENTS = "view_patients",
  ADD_PATIENTS = "add_patients",
  EDIT_PATIENTS = "edit_patients",
  DELETE_PATIENTS = "delete_patients",
  TRANSFER_PATIENTS = "transfer_patients",
  VIEW_SERVICE_PANEL = "view_service_panel",
  EDIT_SERVICE_PANEL = "edit_service_panel",
  VIEW_FOLLOWUP_PANEL = "view_followup_panel",
  EDIT_FOLLOWUP_PANEL = "edit_followup_panel",
  MANAGE_ORDERS = "manage_orders",
  MANAGE_TODOS = "manage_todos",
  MANAGE_USERS = "manage_users",
  MANAGE_CLINIC = "manage_clinic",
}

export const DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  GLOBAL_ADMIN: Object.values(Permission),
  CLINIC_ADMIN: [
    Permission.VIEW_PATIENTS,
    Permission.ADD_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.DELETE_PATIENTS,
    Permission.TRANSFER_PATIENTS,
    Permission.VIEW_SERVICE_PANEL,
    Permission.EDIT_SERVICE_PANEL,
    Permission.VIEW_FOLLOWUP_PANEL,
    Permission.EDIT_FOLLOWUP_PANEL,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_TODOS,
    Permission.MANAGE_USERS,
  ],
  STAFF: [
    Permission.VIEW_PATIENTS,
    Permission.ADD_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.VIEW_SERVICE_PANEL,
    Permission.VIEW_FOLLOWUP_PANEL,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_TODOS,
  ],
};
