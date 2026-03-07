import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { description } = req.body;
    const createdBy = req.user!.id;

    const todo = await prisma.todo.create({
      data: {
        patientId,
        description,
        createdBy,
      },
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { todoId } = req.params;
    const { completed, description } = req.body;

    const todo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed, description },
    });

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { todoId } = req.params;

    await prisma.todo.delete({
      where: { id: todoId },
    });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
