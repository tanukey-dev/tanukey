import {
	Entity,
	Index,
	Column,
	PrimaryColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { id } from "../id.js";
import { User } from "./User.js";

@Entity()
export class Announcement {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Announcement.",
	})
	public createdAt: Date;

	@Column("timestamp with time zone", {
		comment: "The updated date of the Announcement.",
		nullable: true,
	})
	public updatedAt: Date | null;

	@Column("varchar", {
		length: 8192,
		nullable: false,
	})
	public text: string;

	@Column("varchar", {
		length: 256,
		nullable: false,
	})
	public title: string;

	@Column("varchar", {
		length: 1024,
		nullable: true,
	})
	public imageUrl: string | null;

	// info, warning, error, success
	@Column("varchar", {
		length: 256,
		nullable: false,
		default: "info",
	})
	public icon: string;

	// normal ... お知らせページ掲載
	// banner ... お知らせページ掲載 + バナー表示
	// dialog ... お知らせページ掲載 + ダイアログ表示
	@Column("varchar", {
		length: 256,
		nullable: false,
		default: "normal",
	})
	public display: string;

	@Column("boolean", {
		default: false,
	})
	public needConfirmationToRead: boolean;

	@Index()
	@Column("boolean", {
		default: true,
	})
	public isActive: boolean;

	@Index()
	@Column("boolean", {
		default: false,
	})
	public forExistingUsers: boolean;

	@Index()
	@Column({
		...id(),
		nullable: true,
	})
	public userId: User["id"] | null;

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	constructor(data: Partial<Announcement>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
