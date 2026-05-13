import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PublicService } from './public.service';
import { RequestAidDto } from './dto/request-aid.dto';
import { ContactMessageDto } from './dto/contact-message.dto';
import { VolunteerApplicationDto } from './dto/volunteer-application.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('request-aid')
  requestAid(@Body() data: RequestAidDto) {
    return this.publicService.createRequestAid(data);
  }

  @Get('verify/request/:id')
  verifyRequest(@Param('id') id: string) {
    return this.publicService.verifyRequest(id);
  }

  @Get('verify/member/:nationalId')
  verifyMember(@Param('nationalId') nationalId: string) {
    return this.publicService.verifyMember(nationalId);
  }

  @Post('contact')
  contact(@Body() data: ContactMessageDto) {
    return this.publicService.saveContactMessage(data);
  }

  @Post('volunteer')
  volunteer(@Body() data: VolunteerApplicationDto) {
    return this.publicService.saveVolunteerApplication(data);
  }
}
