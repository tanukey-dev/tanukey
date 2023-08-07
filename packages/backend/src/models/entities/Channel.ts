import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from '../id.js';
import { User } from './User.js';
import { DriveFile } from './DriveFile.js';

@Entity()
export class Channel {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the Channel.',
	})
	public createdAt: Date;

	@Index()
	@Column('timestamp with time zone', {
		nullable: true,
	})
	public lastNotedAt: Date | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'The owner ID.',
	})
	public userId: User['id'] | null;

	@ManyToOne(type => User, {
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public user: User | null;

	@Column('varchar', {
		length: 128,
		comment: 'The name of the Channel.',
	})
	public name: string;

	@Column('varchar', {
		length: 2048, nullable: true,
		comment: 'The description of the Channel.',
	})
	public description: string | null;

	@Column({
		...id(),
		nullable: true,
		comment: 'The ID of banner Channel.',
	})
	public bannerId: DriveFile['id'] | null;

	@ManyToOne(type => DriveFile, {
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public banner: DriveFile | null;

	@Column('varchar', {
		array: true, length: 128, default: '{}',
	})
	public pinnedNoteIds: string[];

	@Column('varchar', {
		length: 16,
		default: '#86b300',
	})
	public color: string;

	@Index()
	@Column('boolean', {
		default: false,
	})
	public isArchived: boolean;

	@Column('boolean', {
		default: false,
	})
	public federation: boolean;

	@Index()
	@Column('boolean', {
		default: true,
	})
	public searchable: boolean;

	@Column('boolean', {
		default: true,
	})
	public isNoteCollapsed: boolean;

	@Column('boolean', {
		default: false,
	})
	public isPrivate: boolean;

	@Column('varchar', {
		array: true, length: 128, default: '{}',
	})
	public privateUserIds: User['id'][];

	@Column('varchar', {
		array: true, length: 128, default: '{}',
	})
	public moderatorUserIds: User['id'][];

	@Index()
	@Column('integer', {
		default: 0,
		comment: 'The count of notes.',
	})
	public notesCount: number;

	@Index()
	@Column('integer', {
		default: 0,
		comment: 'The count of users.',
	})
	public usersCount: number;
}
