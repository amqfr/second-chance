import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: CreateUserDto = {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    avatar: 'https://reqres.in/img/faces/1-image.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            getUser: jest.fn(),
            getUserAvatar: jest.fn(),
            deleteUserAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockUser as any);

      const result = await controller.create(mockUser);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUser', () => {
    it('should return a user', async () => {
      jest.spyOn(service, 'getUser').mockResolvedValue(mockUser as any);

      const result = await controller.getUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(service.getUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getUserAvatar', () => {
    it('should return the user avatar in base64', async () => {
      const avatarBase64 = 'base64avatar';
      jest.spyOn(service, 'getUserAvatar').mockResolvedValue(avatarBase64);

      const result = await controller.getUserAvatar(mockUser.id.toString());

      expect(result).toBe(avatarBase64);
      expect(service.getUserAvatar).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete the user avatar', async () => {
      jest.spyOn(service, 'deleteUserAvatar').mockResolvedValue();

      await controller.deleteUserAvatar(mockUser.id);

      expect(service.deleteUserAvatar).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
