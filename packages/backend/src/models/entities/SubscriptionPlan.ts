import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { id } from '../id.js';
import { Role } from './Role.js';

@Entity('subscription_plan')

export class SubscriptionPlan {
	@PrimaryColumn(id())
	public id: string;

	@Column('varchar', {
		length: 128,
	})
	public name: string;

	@Column('integer')
	public price: number;

	@Column('varchar', {
		length: 128,
	})
	public currency: string;

	@Column('varchar', {
		length: 1024,
		nullable: true,
	})
	public description: string | null;

	@Column('varchar', {
		length: 128,
	})
	public stripePriceId: string | null;

	@Index({ unique: true })
	@Column(id())
	public roleId: Role['id'];

	@ManyToOne(type => Role, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public role: Role | null;

	@Column('boolean', {
		default: false,
	})
	public isArchived: boolean;
}
