import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

interface JwtPayload {
  sub: number;
  telegramId: string;
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface PendingLogin {
  code: string;
  createdAt: number;
  telegramId?: bigint;
  userId?: number;
  confirmed: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Хранилище ожидающих кодов авторизации (в памяти)
  // В проде можно заменить на Redis
  private pendingLogins = new Map<string, PendingLogin>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    // Очистка просроченных кодов каждые 5 минут
    setInterval(() => this.cleanupExpiredCodes(), 5 * 60 * 1000);
  }

  // ─── Авторизация через код (новый способ) ───

  /**
   * Генерировать уникальный 6-значный код для авторизации.
   * Фронт вызывает POST /api/auth/code → получает код → показывает юзеру.
   */
  generateLoginCode(): { code: string; expiresIn: number } {
    // Генерируем 6-значный код
    const code = crypto.randomInt(100000, 999999).toString();

    // Сохраняем с TTL 5 минут
    this.pendingLogins.set(code, {
      code,
      createdAt: Date.now(),
      confirmed: false,
    });

    this.logger.log(`Login code generated: ${code}`);

    return { code, expiresIn: 300 }; // 5 минут
  }

  /**
   * Бот подтверждает код — привязывает Telegram юзера к коду.
   * Вызывается когда юзер пишет боту /login XXXXXX.
   */
  async confirmLoginCode(code: string, telegramId: bigint): Promise<boolean> {
    const pending = this.pendingLogins.get(code);

    if (!pending) {
      return false; // код не найден
    }

    // Проверяем срок — 5 минут
    if (Date.now() - pending.createdAt > 5 * 60 * 1000) {
      this.pendingLogins.delete(code);
      return false; // истёк
    }

    if (pending.confirmed) {
      return false; // уже использован
    }

    // Создаём/обновляем юзера
    const user = await this.prisma.user.upsert({
      where: { telegramId },
      update: {},
      create: {
        telegramId,
      },
    });

    // Подтверждаем код
    pending.telegramId = telegramId;
    pending.userId = user.id;
    pending.confirmed = true;

    this.logger.log(`Login code ${code} confirmed by TG user ${telegramId}`);

    return true;
  }

  /**
   * Фронт проверяет код — если подтверждён, возвращает JWT.
   * Фронт вызывает POST /api/auth/code/check каждые 2 сек.
   */
  async checkLoginCode(code: string): Promise<(TokenPair & { user: any }) | null> {
    const pending = this.pendingLogins.get(code);

    if (!pending || !pending.confirmed || !pending.userId) {
      return null;
    }

    // Код подтверждён — генерируем JWT
    const user = await this.prisma.user.findUnique({
      where: { id: pending.userId },
    });

    if (!user) return null;

    // Удаляем использованный код
    this.pendingLogins.delete(code);

    const tokens = this.generateTokens({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    this.logger.log(`User logged in via code: ${user.username || user.telegramId}`);

    return {
      ...tokens,
      user: this.serializeUser(user),
    };
  }

  /**
   * Очистка просроченных кодов (старше 5 минут)
   */
  private cleanupExpiredCodes() {
    const now = Date.now();
    for (const [code, pending] of this.pendingLogins) {
      if (now - pending.createdAt > 5 * 60 * 1000) {
        this.pendingLogins.delete(code);
      }
    }
  }

  // ─── Авторизация через Telegram Login Widget (старый способ — оставляем) ───

  verifyTelegramAuth(data: TelegramAuthDto): boolean {
    const { hash, ...authData } = data;

    const now = Math.floor(Date.now() / 1000);
    if (now - authData.auth_date > 3600) {
      this.logger.warn('Telegram auth data is too old');
      return false;
    }

    const checkString = Object.keys(authData)
      .sort()
      .filter((key) => authData[key as keyof typeof authData] !== undefined)
      .map((key) => `${key}=${authData[key as keyof typeof authData]}`)
      .join('\n');

    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.BOT_TOKEN!)
      .digest();

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return hmac === hash;
  }

  async loginWithTelegram(dto: TelegramAuthDto): Promise<TokenPair & { user: any }> {
    const isValid = this.verifyTelegramAuth(dto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(dto.id) },
      update: {
        username: dto.username || null,
        firstName: dto.first_name || null,
        lastName: dto.last_name || null,
        photoUrl: dto.photo_url || null,
      },
      create: {
        telegramId: BigInt(dto.id),
        username: dto.username || null,
        firstName: dto.first_name || null,
        lastName: dto.last_name || null,
        photoUrl: dto.photo_url || null,
      },
    });

    this.logger.log(`User logged in: ${user.username || user.telegramId}`);

    const tokens = this.generateTokens({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    return {
      ...tokens,
      user: this.serializeUser(user),
    };
  }

  // ─── Общие методы ───

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or deactivated');
      }

      return this.generateTokens({
        sub: user.id,
        telegramId: user.telegramId.toString(),
        role: user.role,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.serializeUser(user);
  }

  private generateTokens(payload: JwtPayload): TokenPair {
    const tokenPayload = { ...payload };

    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    return { accessToken, refreshToken };
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
    };
  }
}
