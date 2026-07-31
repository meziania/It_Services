import { OutreachChannel, OutreachStatus } from '@serviceit-scanner/database';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Docs2/16 "Propose un message / offre de service" + "envoyer après relecture".
 * Creates a draft or marks a message as SENT when the user opens mailto/WhatsApp.
 */
export class CreateOutreachMessageDto {
  @IsEnum(OutreachChannel)
  channel!: OutreachChannel;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsEnum(OutreachStatus)
  status?: OutreachStatus;
}
