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
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Настройки cookie — вынесены в одно место.
   *
   * sameSite: 'none' + secure: true — обязательно для кросс-доменных cookie.
   * Когда фронт на одном домене (tunnel-5173), а бэк на другом (tunnel-3000),
   * 'strict' и 'lax' не дадут браузеру отправить cookie.
   * 'none' разрешает, но требует secure: true (только HTTPS).
   *
   * В dev-режиме на localhost оба на одном домене — можно 'lax'.
   * Но tunnels = разные домены = нужен 'none'.
   */
  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    // Если используются tunnels или production — кросс-доменные cookie
    const isCrossDomain =
      process.env.FRONTEND_URL?.includes('devtunnels') ||
      process.env.FRONTEND_URL?.includes('https://') ||
      isProduction;

    return {
      httpOnly: true,
      secure: isCrossDomain || isProduction, // HTTPS обязателен для sameSite: 'none'
      sameSite: isCrossDomain ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      path: '/api/auth',
    };
  }

  /**
   * POST /api/auth/telegram
   */
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

  /**
   * POST /api/auth/refresh
   */
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

  /**
   * POST /api/auth/logout
   */
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

  /**
   * GET /api/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('sub') userId: number) {
    return this.authService.getCurrentUser(userId);
  }
}
