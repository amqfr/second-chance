import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import { ProducerService } from 'src/producer/producer.service';
import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
    private producerService: ProducerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    const createdUser = await newUser.save();

    const emailDate = {
      email: createdUser.email,
      subject: 'Welcome whit test task',
      html: `<p>Hello ${createdUser.first_name + ' ' + createdUser.last_name},</p>`,
    };

    const eventData = {
      emailDate,
      contxt: 'sample event'
    }

    await this.emailService.sendEmail(emailDate);
    await this.producerService.addToEventQueue(eventData);
    return createdUser;
  }

  async getUser(userId: number): Promise<AxiosResponse<any>> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data.data;
  }

  async getUserAvatar(userId: number): Promise<string> {
    const user = await this.userModel.findOne({ id: userId });
    if (user && user.avatarHash) {
      return user.avatarUrl;
    }

    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    const avatarUrl = response.data.data.avatar;

    const avatarResponse = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    const avatarBuffer = Buffer.from(avatarResponse.data, 'binary');
    const avatarHash = crypto
      .createHash('md5')
      .update(avatarBuffer)
      .digest('hex');
    const avatarBase64 = avatarBuffer.toString('base64');

    user.avatarUrl = avatarBase64;
    user.avatarHash = avatarHash;
    await user.save();

    return avatarBase64;
  }

  async deleteUserAvatar(userId: number): Promise<void> {
    const user = await this.userModel.findOne({ id: userId });
    if (user) {
      user.avatarUrl = null;
      user.avatarHash = null;
      await user.save();
    }
  }
}
