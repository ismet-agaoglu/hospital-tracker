import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';

export const getClinics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    // Global admin tüm klinikleri görür
    if (role === 'GLOBAL_ADMIN') {
      const clinics = await prisma.clinic.findMany({
        include: {
          _count: {
            select: { patients: true, users: true },
          },
        },
      });
      return res.json(clinics);
    }

    // Diğer kullanıcılar sadece yetkili oldukları klinikleri görür
    const userClinics = await prisma.userClinic.findMany({
      where: { userId },
      include: {
        clinic: {
          include: {
            _count: {
              select: { patients: true, users: true },
            },
          },
        },
      },
    });

    const clinics = userClinics.map((uc) => uc.clinic);
    res.json(clinics);
  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClinicById = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    // Permission kontrolü
    if (role !== 'GLOBAL_ADMIN') {
      const userClinic = await prisma.userClinic.findUnique({
        where: {
          userId_clinicId: { userId, clinicId },
        },
      });

      if (!userClinic) {
        return res.status(403).json({ error: 'No access to this clinic' });
      }
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        _count: {
          select: { patients: true, users: true },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (error) {
    console.error('Get clinic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createClinic = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address } = req.body;
    const role = req.user!.role;

    // Sadece global admin klinik oluşturabilir
    if (role !== 'GLOBAL_ADMIN') {
      return res.status(403).json({ error: 'Only global admins can create clinics' });
    }

    const clinic = await prisma.clinic.create({
      data: { name, address },
    });

    // ServicePanel oluştur
    await prisma.servicePanel.create({
      data: { clinicId: clinic.id },
    });

    res.status(201).json(clinic);
  } catch (error) {
    console.error('Create clinic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
