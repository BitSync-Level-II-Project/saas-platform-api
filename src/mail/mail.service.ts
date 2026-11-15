import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface SendActivationOptions {
  to: string;
  name: string;
  workspaceCode: string;
  activationUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const host = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = Number(this.config.get<number>('SMTP_PORT', 465));

    if (!user || !pass) {
      this.logger.warn(
        'SMTP credentials not set. Set SMTP_USER and SMTP_PASS in .env to dispatch live emails.'
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.logger.log(`Mail service initialized with host: ${host} (${user})`);
  }

  async sendActivationEmail(options: SendActivationOptions): Promise<{ success: boolean; message: string }> {
    const { to, name, workspaceCode, activationUrl } = options;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!this.transporter || !user || !pass) {
      this.logger.warn(`Email not dispatched to ${to}: SMTP_USER or SMTP_PASS missing in .env`);
      return {
        success: false,
        message: 'SMTP credentials (SMTP_USER / SMTP_PASS) not configured in backend .env',
      };
    }

    const fromAddress = this.config.get<string>(
      'SMTP_FROM',
      `"SiteTrace Operations" <${user}>`
    );

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="background: #ede9fe; color: #5542f6; width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; line-height: 44px; text-align: center;">
              ST
            </div>
            <div style="margin-left: 12px;">
              <h2 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">SiteTrace</h2>
              <span style="font-size: 12px; color: #64748b;">Field Operations Platform</span>
            </div>
          </div>

          <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
            Activate Your Manager Account
          </h1>

          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${name}</strong>,<br/>
            You have been registered as a Manager in workspace <span style="background: #ede9fe; color: #5542f6; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-weight: 700;">${workspaceCode}</span>.
          </p>

          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 28px;">
            Please click the button below to choose your password and complete your account activation:
          </p>

          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${activationUrl}" style="background-color: #5542f6; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Activate Manager Account
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${activationUrl}" style="color: #5542f6; word-break: break-all;">${activationUrl}</a>
          </p>

          <p style="font-size: 11px; color: #cbd5e1; margin-top: 16px; margin-bottom: 0;">
            This email was sent from SiteTrace. If you did not expect this invitation, you can ignore this email.
          </p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to,
        subject: `Activate your SiteTrace Manager Account · ${workspaceCode}`,
        html: htmlContent,
      });

      this.logger.log(`Activation email sent successfully to ${to} (MessageId: ${info.messageId})`);
      return { success: true, message: `Email delivered to ${to}` };
    } catch (err: any) {
      this.logger.error(`Failed to send activation email to ${to}: ${err.message}`, err.stack);
      return { success: false, message: err.message };
    }
  }
}
