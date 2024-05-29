import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import { ProducerService } from 'src/producer/producer.service';
import axios from 'axios';
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

    const emailData = {
      email: createdUser.email,
      subject: 'Welcome with test task',
      html: `<p>Hello ${createdUser.first_name + ' ' + createdUser.last_name},</p>`,
    };

    const eventData = {
      emailData,
      context: 'sample event'
    }

    await this.emailService.sendEmail(emailData);
    await this.producerService.addToEventQueue(eventData);
    return createdUser;
  }

  async getUser(userId: number): Promise<any> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data.data;
  }

  async getUserAvatar(userId: string): Promise<string> {
    try {
      let existingUser = await this.userModel.findOne({ id: userId });

      if (existingUser && existingUser.avatarHash) {
        return await this.getAvatarFromFile(userId);
      }

      const userData = await this.fetchUserData(userId);

      const { firstName, lastName, email, avatarUrl } = this.getUserDetails(existingUser, userData);

      const imageBuffer = await this.downloadImage(avatarUrl);
      const avatarHash = this.getHash(imageBuffer);

      await this.saveUserAvatar(userId, email, firstName, lastName, avatarUrl, avatarHash, imageBuffer);

      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('Error while fetching or creating user avatar:', error);
      throw error;
    }
  }

  private async getAvatarFromFile(userId: string): Promise<string> {
    const filePath = path.join(__dirname, '../../avatars', `${userId}.jpg`);
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString('base64');
  }

  private async fetchUserData(userId: string): Promise<any> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`, {
      responseType: 'json',
    });
    return response.data.data;
  }

  private getUserDetails(existingUser: User | null, userData: any) {
    const firstName = existingUser?.first_name || userData.first_name;
    const lastName = existingUser?.last_name || userData.last_name;
    const email = existingUser?.email || userData.email;
    const avatarUrl = userData.avatar;
    return { firstName, lastName, email, avatarUrl };
  }

  private async saveUserAvatar(userId: string, email: string, firstName: string, lastName: string, avatarUrl: string, avatarHash: string, imageBuffer: Buffer) {
    const newUser = new this.userModel({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      avatarUrl,
      avatarHash,
    });

    await newUser.save();

    const avatarsDir = path.join(__dirname, '../../avatars');
    await fs.mkdir(avatarsDir, { recursive: true });

    const filePath = path.join(avatarsDir, `${userId}.jpg`);
    await fs.writeFile(filePath, imageBuffer);
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  private getHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
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
        console.error(`Error deleting avatar image file for user ${userId}:`, error);
      }
    }
  }
}
