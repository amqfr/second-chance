import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'QueueTest',
        host: 'smtp.elasticemail.com',
        port: '2525',
        auth: {
          user: 'amqfr@yahoo.com',
          pass: 'FD90444A71918F673D1D4AC0CE247F025255',
        },
      },
      defaults: {
        from: 'amqfr@yahoo.com',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
