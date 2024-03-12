import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { id } from '../id.js';
import { User } from './User.js';

@Entity()
export class UserPoint {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column({
		...id(),
		comment: 'The ID of author.',
	})
	public userId: User['id'];

	@ManyToOne(type => User, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: User | null;

	@Column('integer', {
		default: 0,
	})
	public point: number;

	@Column('timestamp with time zone', {
		nullable: true,
	})
	public updatedAtDailyFirstNote: Date | null;
}
