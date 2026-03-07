import { Response, NextFunction } from 'express';
import { AuthRequest, Permission } from '../types';
import prisma from '../utils/prisma';

export const checkPermission = (requiredPermission: Permission) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: userId, role } = req.user;

    // Global admin geçer
    if (role === 'GLOBAL_ADMIN') {
      return next();
    }

    // Clinic ID parametreden al
    const clinicId = req.params.clinicId || req.body.clinicId;

    if (!clinicId) {
      return res.status(400).json({ error: 'Clinic ID required' });
    }

    // Kullanıcının bu klinikteki permissionlarını kontrol et
    const userClinic = await prisma.userClinic.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });

    if (!userClinic) {
      return res.status(403).json({ error: 'No access to this clinic' });
    }

    const permissions: Permission[] = JSON.parse(userClinic.permissions);

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
