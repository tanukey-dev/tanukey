import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from '../id.js';
import { Circle } from './Circle.js';
import { Event } from './Event.js';
import { DriveFile } from './DriveFile.js';
import { Page } from './Page.js';

@Entity()
@Index(['eventId', 'circleId'], { unique: true })
export class EventCircle {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the EventCircle.',
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
	})
	public eventId: Event['id'];

	@ManyToOne(type => Event, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public event: Event | null;

	@Index()
	@Column({
		...id(),
	})
	public circleId: Circle['id'];

	@ManyToOne(type => Circle, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public circle: Circle | null;

	@Column('varchar', {
		length: 8192, nullable: true,
	})
	public description: string | null;

	@Column({ ...id(), nullable: true })
	public pageId: Page['id'] | null;

	@Index()
	@Column('boolean', {
		default: false,
	})
	public isArchived: boolean;
}
