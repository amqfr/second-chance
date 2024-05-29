import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ProducerService } from './producer/producer.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/users'),
    UsersModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProducerService],
})
export class AppModule {}
