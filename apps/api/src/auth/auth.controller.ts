import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, ConnectWalletDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect-wallet')
  async connectWallet(@Request() req: any, @Body() dto: ConnectWalletDto) {
    return this.authService.connectWallet(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disconnect-wallet')
  async disconnectWallet(@Request() req: any) {
    return this.authService.disconnectWallet(req.user.id);
  }
}
