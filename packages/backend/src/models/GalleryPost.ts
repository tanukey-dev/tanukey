/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Entity, Index, JoinColumn, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import type { MiDriveFile } from './DriveFile.js';

@Entity('gallery_post')
export class MiGalleryPost {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The updated date of the GalleryPost.',
	})
	public updatedAt: Date;

	@Column('varchar', {
		length: 256,
	})
	public title: string;

	@Column('varchar', {
		length: 2048, nullable: true,
	})
	public description: string | null;

	@Index()
	@Column({
		...id(),
		comment: 'The ID of author.',
	})
	public userId: MiUser['id'];

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser | null;

	@Index()
	@Column({
		...id(),
		array: true, default: '{}',
	})
	public fileIds: MiDriveFile['id'][];

	@Index()
	@Column('boolean', {
		default: false,
		comment: 'Whether the post is sensitive.',
	})
	public isSensitive: boolean;

	@Index()
	@Column('integer', {
		default: 0,
	})
	public likedCount: number;

	@Index()
	@Column('varchar', {
		length: 128, array: true, default: '{}',
	})
	public tags: string[];

	constructor(data: Partial<MiGalleryPost>) {
		if (data == null) return;

		for (const [k, v] of Object.entries(data)) {
			(this as any)[k] = v;
		}
	}
}
