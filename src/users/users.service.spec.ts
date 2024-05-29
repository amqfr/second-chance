import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { EmailService } from '../email/email.service';
import { ProducerService } from '../producer/producer.service';
import axios from 'axios';
import * as fs from 'fs';
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

  const mockEmailDate = {
    email: 'amqfr@yahoo.com',
    subject: 'Welcome whit test task',
    html: `<p>Hello Amirmohammad Qaffari,</p>`,
  };

  const mockEventData = {
    mockEmailDate,
    contxt: 'sample event'
  }

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
      const saveSpy = jest.spyOn(userModel.prototype, 'save').mockResolvedValue(mockUser);
      const sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue(null);
      const addToEventQueueSpy = jest.spyOn(producerService, 'addToEventQueue').mockResolvedValue(null);

      const result = await service.create(mockUserDto);

      expect(saveSpy).toHaveBeenCalledWith(mockUserDto);
      expect(sendEmailSpy).toHaveBeenCalledWith(mockEmailDate);
      expect(addToEventQueueSpy).toHaveBeenCalledWith(mockEventData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return user data from external API', async () => {
      const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: mockUser } });

      const result = await service.getUser(mockUser.id);

      expect(axiosGetSpy).toHaveBeenCalledWith(`https://reqres.in/api/users/${mockUser.id}`);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserAvatar', () => {
    it('should return avatar in base64 on first request and save it', async () => {
      const findOneSpy = jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: { data: mockUser } })
        .mockResolvedValueOnce({ data: Buffer.from('avatar data', 'binary') });
      const saveSpy = jest.spyOn(userModel.prototype, 'save').mockResolvedValue(null);

      const result = await service.getUserAvatar(mockUser.id.toString());

      expect(findOneSpy).toHaveBeenCalled();
      expect(axiosGetSpy).toHaveBeenCalledTimes(2);
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toBe(Buffer.from('avatar data').toString('base64'));
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete the user avatar', async () => {
      const findOneSpy = jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser);
      const saveSpy = jest.spyOn(userModel.prototype, 'save').mockResolvedValue(null);
      const unlinkSpy = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);

      await service.deleteUserAvatar(mockUser.id);

      expect(findOneSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      expect(unlinkSpy).toHaveBeenCalled();
      expect(mockUser.avatarUrl).toBeNull();
      expect(mockUser.avatarHash).toBeNull();
    });
  });
});
