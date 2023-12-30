import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Role } from "@/models/Role.js";
import { id } from './util/id.js';

@Entity('subscription_plan')

export class SubscriptionPlan {
	@PrimaryColumn(id())
	public id: string;

	@Column('varchar', {
		length: 128
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
