import { Test, TestingModule } from '@nestjs/testing';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('FamiliesController', () => {
  let controller: FamiliesController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [FamiliesController],
      providers: [{ provide: FamiliesService, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<FamiliesController>(FamiliesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
