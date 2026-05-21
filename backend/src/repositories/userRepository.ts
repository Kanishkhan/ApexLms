import { User, IUser } from '../models/User';
import { mockUsers } from './mockMemoryDb';
import { Types } from 'mongoose';

export class UserRepository {
  async findByEmail(email: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    return User.findOne({ email });
  }

  async findById(id: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockUsers.find((u) => u._id === id) || null;
    }
    if (!Types.ObjectId.isValid(id)) return null;
    return User.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<any> {
    if (global.isMockDb) {
      const newUser = {
        _id: `u-${mockUsers.length + 1}`,
        name: userData.name || '',
        email: userData.email || '',
        passwordHash: userData.passwordHash || '',
        role: userData.role || 'student',
        avatarUrl: userData.avatarUrl || '',
        refreshToken: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return newUser;
    }
    return User.create(userData);
  }

  async update(id: string, updateData: Partial<IUser>): Promise<any | null> {
    if (global.isMockDb) {
      const idx = mockUsers.findIndex((u) => u._id === id);
      if (idx === -1) return null;
      mockUsers[idx] = {
        ...mockUsers[idx],
        ...updateData,
        updatedAt: new Date(),
      } as any;
      return mockUsers[idx];
    }
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findAll(): Promise<any[]> {
    if (global.isMockDb) {
      return mockUsers;
    }
    return User.find({});
  }

  async delete(id: string): Promise<boolean> {
    if (global.isMockDb) {
      const idx = mockUsers.findIndex((u) => u._id === id);
      if (idx === -1) return false;
      mockUsers.splice(idx, 1);
      return true;
    }
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}
export const userRepository = new UserRepository();
