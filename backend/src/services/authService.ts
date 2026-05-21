import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/customErrors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  async register(data: any): Promise<any> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'student',
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
    });

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    await userRepository.update(user._id, { refreshToken });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: any): Promise<any> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    await userRepository.update(user._id, { refreshToken });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<any> {
    if (!token) throw new UnauthorizedError('No refresh token provided');

    try {
      const decoded = verifyRefreshToken(token);
      const user = await userRepository.findById(decoded.userId);
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Invalid refresh token session');
      }

      const accessToken = generateAccessToken({ userId: user._id, role: user.role });
      const newRefreshToken = generateRefreshToken({ userId: user._id, role: user.role });

      await userRepository.update(user._id, { refreshToken: newRefreshToken });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await userRepository.update(userId, { refreshToken: '' });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  async updateProfile(userId: string, data: any): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const update: any = {};
    if (data.name) update.name = data.name;
    if (data.avatarUrl) update.avatarUrl = data.avatarUrl;

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      update.passwordHash = await bcrypt.hash(data.password, salt);
    }

    const updatedUser = await userRepository.update(userId, update);
    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
    };
  }
}

export const authService = new AuthService();
