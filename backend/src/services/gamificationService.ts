import { Achievement, IAchievement } from '../models/Achievement';
import { Notification } from '../models/Notification';
import { NotFoundError } from '../utils/customErrors';

export class GamificationService {
  async getStudentProgress(studentId: string): Promise<IAchievement> {
    let achievement = await Achievement.findOne({ student: studentId });
    if (!achievement) {
      achievement = await Achievement.create({
        student: studentId as any,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      });
    }
    return achievement;
  }

  // Adding XP dynamically and resolving Level thresholds
  async addXp(studentId: string, amount: number, reason: string): Promise<IAchievement> {
    const progress = await this.getStudentProgress(studentId);
    progress.totalXp += amount;

    // Standard RPG XP calculation algorithm: Level = floor(sqrt(XP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(progress.totalXp / 100)) + 1;
    let leveledUp = false;

    if (newLevel > progress.level) {
      progress.level = newLevel;
      leveledUp = true;
    }

    await progress.save();

    // Trigger Notification alerts
    await Notification.create({
      user: studentId as any,
      title: `Earned +${amount} XP!`,
      message: `XP awarded for: ${reason}`,
      type: 'achievement',
    });

    if (leveledUp) {
      await Notification.create({
        user: studentId as any,
        title: `🎉 Leveled Up to Level ${newLevel}!`,
        message: `Congratulations! You've achieved a new architectural milestone!`,
        type: 'achievement',
      });
      
      // Auto unlock level badge milestones
      await this.unlockBadge(studentId, `level-${newLevel}`, `Level ${newLevel} Specialist`);
    }

    return progress;
  }

  // Calculating login streaks
  async updateActiveStreak(studentId: string): Promise<IAchievement> {
    const progress = await this.getStudentProgress(studentId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!progress.lastActiveDate) {
      progress.currentStreak = 1;
      progress.longestStreak = 1;
    } else {
      const lastActive = new Date(progress.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active yesterday, increment streak
        progress.currentStreak += 1;
        if (progress.currentStreak > progress.longestStreak) {
          progress.longestStreak = progress.currentStreak;
        }
      } else if (diffDays > 1) {
        // Active more than 1 day ago, streak broken
        progress.currentStreak = 1;
      }
      // If active today (diffDays === 0), keep current streak unchanged
    }

    progress.lastActiveDate = new Date();
    await progress.save();

    // Unlock streak badges
    if (progress.currentStreak === 3) {
      await this.unlockBadge(studentId, 'streak-3', '3-Day Studying Flame');
    } else if (progress.currentStreak === 7) {
      await this.unlockBadge(studentId, 'streak-7', '7-Day Unstoppable Archer');
    }

    return progress;
  }

  // Awarding Custom Badges
  async unlockBadge(studentId: string, badgeId: string, title: string): Promise<IAchievement> {
    const progress = await this.getStudentProgress(studentId);
    
    const hasBadge = progress.badges.some((b) => b.badgeId === badgeId);
    if (!hasBadge) {
      progress.badges.push({
        badgeId,
        title,
        unlockedAt: new Date(),
      });
      await progress.save();

      // Trigger Dispatch Notification
      await Notification.create({
        user: studentId as any,
        title: `🏆 Badge Unlocked: ${title}`,
        message: `You earned the "${title}" badge! View your showcase in the dashboard.`,
        type: 'achievement',
      });
    }

    return progress;
  }
}

export const gamificationService = new GamificationService();
