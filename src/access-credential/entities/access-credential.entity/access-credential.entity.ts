/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CredentialType {
  QR = 'QR',
  NFC = 'NFC',
  PIN = 'PIN',
}

@Entity()
export class AccessCredentialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CredentialType })
  type: CredentialType;

  @Column()
  secret_hash: string;

  @Column()
  valid_from: Date;

  @Column()
  valid_to: Date;
}
