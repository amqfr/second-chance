import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import { ProducerService } from 'src/producer/producer.service';
import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

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
    // await this.producerService.addToEventQueue(eventData);
    return createdUser;
  }

  async getUser(userId: number): Promise<AxiosResponse<any>> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data.data;
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  private getHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }


  async getUserAvatar(userId: string): Promise<string> {
    try {
      let user = await this.userModel.findOne({ userId });

      if (user && user.avatarHash) {
        const filePath = path.join(__dirname, '../../avatars', `${userId}.jpg`);
        const fileBuffer = await fs.readFile(filePath);
        return fileBuffer.toString('base64');
      }

      const response = await axios.get(
        `https://reqres.in/api/users/${userId}`,
        {
          responseType: 'json',
        },
      );

      const avatarUrl = response.data.data.avatar;
      const firstName = response.data.data.first_name;
      const lastName = response.data.data.last_name;
      const email = response.data.data.email;
      const imageBuffer = await this.downloadImage(avatarUrl);
      const avatarHash = this.getHash(imageBuffer);

      user = new this.userModel({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        avatarUrl,
        avatarHash,
      });

      await user.save();

      const avatarsDir = path.join(__dirname, '../../avatars');
      await fs.mkdir(avatarsDir, { recursive: true });

      const filePath = path.join(avatarsDir, `${userId}.jpg`);
      await fs.writeFile(filePath, imageBuffer);

      return imageBuffer.toString('base64');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteUserAvatar(userId: number): Promise<void> {
    const user = await this.userModel.findOne({ id: userId });
  
  if (user) {
    user.avatarUrl = null;
    user.avatarHash = null;
    await user.save();

    const filePath = path.join(__dirname, '../../avatars', `${userId}.jpg`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Handle error if file does not exist or other file-related errors
      console.error(
        `Error deleting avatar image file for user ${userId}:`,
        error,
      );
    }
  }
  }
}
