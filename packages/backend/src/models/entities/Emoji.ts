import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { id } from "../id.js";
import type { DriveFile } from "./DriveFile.js";

export enum EmojiStatus {
	DRAFT = "DRAFT",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
}

@Entity()
@Index(["name", "host"], { unique: true })
export class Emoji {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		nullable: true,
	})
	public updatedAt: Date | null;

	@Index()
	@Column("varchar", {
		length: 128,
	})
	public name: string;

	@Index()
	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public host: string | null;

	@Column("varchar", {
		length: 128,
		nullable: true,
	})
	public category: string | null;

	@Index()
	@Column({
		...id(),
		nullable: true,
	})
	public driveFileId: DriveFile["id"] | null;

	@Column("varchar", {
		length: 512,
	})
	public originalUrl: string;

	@Column("varchar", {
		length: 512,
		default: "",
	})
	public publicUrl: string;

	@Column("varchar", {
		length: 512,
		nullable: true,
	})
	public uri: string | null;

	// publicUrlの方のtypeが入る
	@Column("varchar", {
		length: 64,
		nullable: true,
	})
	public type: string | null;

	@Column("varchar", {
		array: true,
		length: 128,
		default: "{}",
	})
	public aliases: string[];

	@Column("varchar", {
		length: 1024,
		nullable: true,
	})
	public license: string | null;

	@Column("enum", {
		enum: EmojiStatus,
		default: EmojiStatus.DRAFT,
	})
	public status: EmojiStatus;

	@Column("boolean", {
		default: false,
		nullable: false,
	})
	public localOnly: boolean;

	@Column("boolean", {
		default: false,
	})
	public isSensitive: boolean;

	// TODO: 定期ジョブで存在しなくなったロールIDを除去するようにする
	@Column("varchar", {
		array: true,
		length: 128,
		default: "{}",
	})
	public roleIdsThatCanBeUsedThisEmojiAsReaction: string[];
}
