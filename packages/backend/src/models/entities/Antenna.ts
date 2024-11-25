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
import { UserList } from "./UserList.js";

@Entity()
export class Antenna {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the Antenna.",
	})
	public createdAt: Date;

	@Index()
	@Column("timestamp with time zone")
	public lastUsedAt: Date;

	@Index()
	@Column("boolean", {
		default: false,
	})
	public public: boolean;

	@Index()
	@Column({
		...id(),
		comment: "The owner ID.",
	})
	public userId: User["id"];

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Column("varchar", {
		length: 128,
		comment: "The name of the Antenna.",
	})
	public name: string;

	@Column("varchar", {
		length: 1024,
		array: true,
		default: "{}",
	})
	public users: string[];

	@Column("varchar", {
		length: 1024,
		array: true,
		default: "{}",
	})
	public excludeUsers: string[];

	@Column("jsonb", {
		default: [],
	})
	public keywords: string[][];

	@Column("jsonb", {
		default: [],
	})
	public excludeKeywords: string[][];

	@Column("boolean", {
		default: false,
	})
	public caseSensitive: boolean;

	@Column("boolean", {
		default: false,
	})
	public withReplies: boolean;

	@Column("boolean")
	public withFile: boolean;

	@Column("varchar", {
		length: 2048,
		nullable: true,
	})
	public expression: string | null;

	@Column("boolean")
	public notify: boolean;

	@Index()
	@Column("boolean", {
		default: true,
	})
	public isActive: boolean;

	@Column("boolean", {
		default: false,
	})
	public localOnly: boolean;

	@Column("boolean", {
		default: false,
	})
	public remoteOnly: boolean;

	@Column("varchar", {
		length: 1024,
		array: true,
		default: [],
	})
	public imageTypes: string[];

	@Column("varchar", {
		length: 1024,
		array: true,
		default: [],
	})
	public imageLabels: string[];

	@Column("jsonb", {
		default: [],
	})
	public compositeAntennaIds: Antenna["id"][];

	@Column("text", {
		nullable: true,
	})
	public filterTree: string | null;
}
