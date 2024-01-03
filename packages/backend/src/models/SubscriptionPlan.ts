import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { id } from './util/id.js';
import { MiRole } from "@/models/Role.js";

@Entity('subscription_plan')
export class MiSubscriptionPlan {
	@PrimaryColumn(id())
	public id: string;

	@Column('varchar', {
		length: 128,
	})
	public name: string;

	@Column('varchar', {
		length: 128
	})
	public stripePriceId: string;

	@Index({ unique: true })
	@Column(id())
	public roleId: MiRole['id'];

	@ManyToOne(type => MiRole, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public role: MiRole | null;

	@Column('boolean', {
		default: false,
	})
	public isArchived: boolean;
}
