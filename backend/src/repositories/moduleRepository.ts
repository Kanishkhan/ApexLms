import { Module, IModule } from '../models/Module';
import { mockModules } from './mockMemoryDb';
import { Types } from 'mongoose';

export class ModuleRepository {
  async findByCourseId(courseId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockModules
        .filter((m) => m.course === courseId)
        .sort((a, b) => a.order - b.order);
    }
    return Module.find({ course: courseId }).sort({ order: 1 });
  }

  async findById(id: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockModules.find((m) => m._id === id) || null;
    }
    if (!Types.ObjectId.isValid(id)) return null;
    return Module.findById(id);
  }

  async create(moduleData: Partial<IModule>): Promise<any> {
    if (global.isMockDb) {
      const newModule = {
        ...moduleData,
        _id: `m-${mockModules.length + 1}`,
        course: String(moduleData.course),
        title: moduleData.title || '',
        description: moduleData.description || '',
        order: Number(moduleData.order) || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockModules.push(newModule);
      return newModule;
    }
    return Module.create(moduleData);
  }

  async update(id: string, moduleData: Partial<IModule>): Promise<any | null> {
    if (global.isMockDb) {
      const idx = mockModules.findIndex((m) => m._id === id);
      if (idx === -1) return null;
      mockModules[idx] = {
        ...mockModules[idx],
        ...moduleData,
        updatedAt: new Date(),
      } as any;
      return mockModules[idx];
    }
    return Module.findByIdAndUpdate(id, moduleData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (global.isMockDb) {
      const idx = mockModules.findIndex((m) => m._id === id);
      if (idx === -1) return false;
      mockModules.splice(idx, 1);
      return true;
    }
    const result = await Module.findByIdAndDelete(id);
    return !!result;
  }
}

export const moduleRepository = new ModuleRepository();
