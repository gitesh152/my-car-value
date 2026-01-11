import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Report } from '../reports/report.entity';

@Entity({ name: 'users', schema: 'public' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
