import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	ManyToOne,
} from "typeorm";
import { id } from "../id.js";
import { User } from "./User.js";
import { DriveFile } from "./DriveFile.js";
import { Page } from "./Page.js";

@Entity()
export class Circle {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column("timestamp with time zone", {
		comment: "The created date of the Circle.",
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: "The owner ID.",
	})
	public userId: User["id"] | null;

	@ManyToOne((type) => User, {
		onDelete: "SET NULL",
	})
	@JoinColumn()
	public user: User | null;

	@Column("varchar", {
		length: 128,
	})
	public name: string;

	@Column("varchar", {
		length: 8192,
		nullable: true,
	})
	public description: string | null;

	@Column({
		...id(),
		nullable: true,
		comment: "The ID of banner Channel.",
	})
	public profileImageId: DriveFile["id"] | null;

	@ManyToOne((type) => DriveFile, {
		onDelete: "SET NULL",
	})
	@JoinColumn()
	public profileImage: DriveFile | null;

	@Column({ ...id(), nullable: true })
	public pageId: Page["id"] | null;

	@Index()
	@Column("boolean", {
		default: false,
	})
	public isArchived: boolean;
}
