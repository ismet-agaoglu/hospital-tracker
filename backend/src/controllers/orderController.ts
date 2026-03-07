import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { medication, dosage, frequency, notes } = req.body;
    const createdBy = req.user!.id;

    const order = await prisma.order.create({
      data: {
        patientId,
        medication,
        dosage,
        frequency,
        notes,
        createdBy,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { medication, dosage, frequency, notes } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { medication, dosage, frequency, notes },
    });

    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    await prisma.order.delete({
      where: { id: orderId },
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
