import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service.js';

class InviteManagerDto {
  name: string;
  email: string;
  workspaceCode: string;
  activationUrl?: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly mailService: MailService) {}

  @Post('invite-manager')
  async inviteManager(@Body() body: InviteManagerDto) {
    if (!body.email || !body.name || !body.workspaceCode) {
      throw new BadRequestException('name, email, and workspaceCode are required');
    }

    const activationUrl =
      body.activationUrl ||
      `http://localhost:5173/activate-account?ws=${encodeURIComponent(
        body.workspaceCode
      )}&email=${encodeURIComponent(body.email)}`;

    const result = await this.mailService.sendActivationEmail({
      to: body.email,
      name: body.name,
      workspaceCode: body.workspaceCode,
      activationUrl,
    });

    return {
      success: result.success,
      message: result.message,
      email: body.email,
      workspaceCode: body.workspaceCode,
      activationUrl,
    };
  }

  @Post('resend-activation')
  async resendActivation(@Body() body: InviteManagerDto) {
    return this.inviteManager(body);
  }
}
