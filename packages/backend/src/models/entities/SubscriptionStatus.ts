import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { subscriptionStatus } from "@/types.js";
import { id } from "../id.js";
import { SubscriptionPlan } from "./SubscriptionPlan.js";
import { User } from "./User.js";

@Entity("subscription_status")
@Index(["userId", "planId"], { unique: true })
export class SubscriptionStatus {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column({
		...id(),
		nullable: true,
	})
	public userId: User["id"] | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
	})
	public planId: SubscriptionPlan["id"] | null;

	@Column("enum", {
		enum: subscriptionStatus,
		default: "none",
	})
	public status: (typeof subscriptionStatus)[number];
}
