import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const isCrossDomain =
      process.env.FRONTEND_URL?.includes('devtunnels') ||
      process.env.FRONTEND_URL?.includes('https://') ||
      isProduction;

    return {
      httpOnly: true,
      secure: isCrossDomain || isProduction,
      sameSite: isCrossDomain ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    };
  }

  // ─── Авторизация через код (основной способ) ───

  /**
   * POST /api/auth/code
   * Генерирует 6-значный код. Фронт показывает юзеру.
   */
  @Post('code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async generateCode() {
    return this.authService.generateLoginCode();
  }

  /**
   * POST /api/auth/code/check
   * Фронт опрашивает — подтверждён ли код. Если да — возвращает JWT.
   */
  @Post('code/check')
  @HttpCode(HttpStatus.OK)
  async checkCode(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.checkLoginCode(code);

    if (!result) {
      return { confirmed: false };
    }

    // Код подтверждён — ставим cookie и возвращаем JWT
    res.cookie('refreshToken', result.refreshToken, this.getCookieOptions());

    return {
      confirmed: true,
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ─── Авторизация через Telegram Login Widget (фоллбэк) ───

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  async loginWithTelegram(
    @Body() dto: TelegramAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithTelegram(dto);
    res.cookie('refreshToken', result.refreshToken, this.getCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // ─── Refresh / Logout / Me ───

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return { accessToken: null };
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, this.getCookieOptions());

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      path: '/api/auth',
      sameSite: this.getCookieOptions().sameSite,
      secure: this.getCookieOptions().secure,
    });
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('sub') userId: number) {
    return this.authService.getCurrentUser(userId);
  }
}
