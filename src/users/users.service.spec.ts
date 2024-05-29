import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { ProducerService } from '../producer/producer.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('axios');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;
  let emailService: EmailService;
  let producerService: ProducerService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    avatarUrl: null,
    avatarHash: null,
  };

  const mockUserDto: CreateUserDto = {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    avatar: null
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: ProducerService,
          useValue: {
            addToEventQueue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    emailService = module.get<EmailService>(EmailService);
    producerService = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user, send email and publish event', async () => {
      userModel.prototype.save = jest.fn().mockResolvedValue(mockUser);
      const sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(null);
      const addToEventQueueSpy = jest.spyOn(producerService, 'addToEventQueue').mockResolvedValue(null);

      const result = await service.create(mockUserDto);

      expect(userModel.prototype.save).toHaveBeenCalled();
      expect(sendEmailSpy).toHaveBeenCalled();
      expect(addToEventQueueSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return user data from external API', async () => {
      axios.get = jest.fn().mockResolvedValue({ data: { data: mockUser } });

      const result = await service.getUser(mockUser.id);

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserAvatar', () => {
    it('should return avatar in base64 on first request and save it', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);
      axios.get = jest.fn().mockImplementation((url, config) => {
        if (config && config.responseType === 'arraybuffer') {
          return { data: Buffer.from('avatar data', 'binary') };
        }
        return { data: { data: mockUser } };
      });

      const result = await service.getUserAvatar(mockUser.id);

      expect(result).toBe(Buffer.from('avatar data').toString('base64'));
      expect(userModel.findOne).toHaveBeenCalled();
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete the user avatar', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);

      await service.deleteUserAvatar(mockUser.id);

      expect(mockUser.avatarUrl).toBeNull();
      expect(mockUser.avatarHash).toBeNull();
      expect(userModel.prototype.save).toHaveBeenCalled();
    });
  });
});
