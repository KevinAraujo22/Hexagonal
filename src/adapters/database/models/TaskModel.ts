import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskModel = mongoose.model<ITaskDocument>('Task', taskSchema);
