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
  sub: number;       // user.id
  telegramId: string; // bigint as string
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Верификация данных Telegram Login Widget
   * https://core.telegram.org/widgets/login#checking-authorization
   */
  verifyTelegramAuth(data: TelegramAuthDto): boolean {
    const { hash, ...authData } = data;

    // 1. Проверяем что auth_date не старше 1 часа
    const now = Math.floor(Date.now() / 1000);
    if (now - authData.auth_date > 3600) {
      this.logger.warn('Telegram auth data is too old');
      return false;
    }

    // 2. Создаём data-check-string (все поля кроме hash, отсортированные)
    const checkString = Object.keys(authData)
      .sort()
      .filter((key) => authData[key as keyof typeof authData] !== undefined)
      .map((key) => `${key}=${authData[key as keyof typeof authData]}`)
      .join('\n');

    // 3. Secret key = SHA256(BOT_TOKEN)
    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.BOT_TOKEN!)
      .digest();

    // 4. HMAC-SHA256(data-check-string, secret_key)
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return hmac === hash;
  }

  /**
   * Авторизация через Telegram: верификация + создание/обновление юзера + JWT
   */
  async loginWithTelegram(dto: TelegramAuthDto): Promise<TokenPair & { user: any }> {
    // 1. Верифицируем данные от Telegram
    const isValid = this.verifyTelegramAuth(dto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    // 2. Создаём или обновляем пользователя
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

    // 3. Генерируем JWT пару
    const tokens = this.generateTokens({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    // 4. Сериализуем BigInt для ответа
    return {
      ...tokens,
      user: this.serializeUser(user),
    };
  }

  /**
   * Обновление access token по refresh token
   */
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

  /**
   * Получить текущего пользователя по ID
   */
  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.serializeUser(user);
  }

  /**
   * Генерация пары токенов
   */
  private generateTokens(payload: JwtPayload): TokenPair {
    // Spread в новый объект — jwtService.sign() ожидает plain object,
    // а не экземпляр класса/интерфейса. Spread создаёт чистый Record.
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

  /**
   * Сериализация User (BigInt → string)
   */
  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
    };
  }
}
