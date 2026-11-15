import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
})
export class AuthModule {}
