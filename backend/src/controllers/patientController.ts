import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    const { panelType } = req.query;

    const where: any = { clinicId };

    if (panelType) {
      where.panelType = panelType;
    }

    // TAKIP panelinde sadece kullanıcıya atanan hastalar
    if (panelType === 'TAKIP') {
      where.assignedUserId = req.user!.id;
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        todos: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { admissionDate: 'desc' },
    });

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        todos: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { clinicId } = req.params;
    const {
      firstName,
      lastName,
      age,
      gender,
      diagnosis,
      attendingDoctor,
      admissionDate,
      roomNumber,
      bedNumber,
      visitNote,
      panelType = 'SERVIS',
    } = req.body;

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        age,
        gender,
        diagnosis,
        attendingDoctor,
        admissionDate: new Date(admissionDate),
        roomNumber,
        bedNumber,
        visitNote,
        panelType,
        clinicId,
        assignedUserId: panelType === 'TAKIP' ? req.user!.id : null,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const data = req.body;

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data,
    });

    res.json(patient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    await prisma.patient.delete({
      where: { id: patientId },
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const transferPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { panelType, assignedUserId } = req.body;

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        panelType,
        assignedUserId: panelType === 'TAKIP' ? assignedUserId : null,
      },
    });

    res.json(patient);
  } catch (error) {
    console.error('Transfer patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
