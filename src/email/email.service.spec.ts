import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email', async () => {
      const mailOptions = {
        email: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      };

      (mailerService.sendMail as jest.Mock).mockResolvedValue(null);

      await service.sendEmail(mailOptions);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: mailOptions.email,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
    });

    it('should throw an error if sendMail fails', async () => {
      const mailOptions = {
        email: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      };

      (mailerService.sendMail as jest.Mock).mockRejectedValue(new Error('Email sending failed'));

      await expect(service.sendEmail(mailOptions)).rejects.toThrow('Email sending failed');
    });
  });
});
