<template>
	<MkModalWindow ref="dialog" :width="400" :height="isRequest ? 600 : 700" @close="dialog.close()"
		@closed="$emit('closed')">
		<template v-if="emoji" #header>:{{ emoji.name }}:</template>
		<template v-else-if="isRequest" #header>{{ i18n.ts.requestCustomEmojis }}</template>
		<template v-else #header>New emoji</template>

		<v-alert v-if="isRequest" title="申請に関する諸注意" type="info" variant="tonal">
			<p>現在、絵文字リアクションは基本的に承認を通さずに追加できます。ただし一部条件で申請できない、または承認を通す必要があります。</p>
			<p>以下の場合は申請できません。</p>
			<p>
				・商用利用不可のフォントを含む<br>
				・JASRAC、NexToneなどの管理楽曲の歌詞を含む<br>
				・申請者が権利を持っていない、またはライセンスで2次利用が許可されていない素材を含む<br>
				・制作者・ライセンスが不明なもの
			</p>
			<p>
				以下の場合は承認が必要です。承認リクエストフラグを有効化して作成してください。当てはまるか不明な場合、心配な場合は承認を通してください。
				承認は不定期に行われるため、利用可能まで時間がかかる場合があります。また審査により却下される場合があります。
				一度リジェクトされた絵文字の再申請は強制的に承認リクエストが有効になります。
			</p>
			<p>■ 共通</p>
			<p>
				・アニメーションが含まれる絵文字<br>
				・色彩がきつく目に痛い可能性がある絵文字<br>
				・政治、宗教、特定の主張を含む絵文字<br>
				・性的な表現を含む絵文字<br>
				・グロテスクな表現を含む絵文字
			</p>
			<p>■ 文字入りの場合</p>
			<p>
				・特定の人物、キャラクター、団体、キャッチコピーなどを含むもの<br>
				・批判的、ネガティブな意味合いを含むもの<br>
				・サーバールールへの言及など自治行為に繋がりかねないもの
			</p>
			<p>■ イラスト入りの場合</p>
			<p>
				・虫など苦手な人がいそうと思われるもの<br>
				・別サービスのアイコン
			</p>
			<p>承認可能な権利をもつユーザーを基本的に信用する形の運用となっております。上記内容をよく読んで申請をお願いいたします。申請が通っている絵文字もあとから運営の判断で却下される場合があります。</p>
		</v-alert>
		<div>
			<MkSpacer :marginMin="20" :marginMax="28">
				<div class="_gaps_m">
					<div v-if="imgUrl != null" :class="$style.imgs">
						<div style="background: #fff;" :class="$style.imgContainer">
							<img :src="imgUrl" :class="$style.img" />
						</div>
						<div style="background: rgb(25, 35, 32);" :class="$style.imgContainer">
							<img :src="imgUrl" :class="$style.img" />
						</div>
					</div>
					<MkButton rounded style="margin: 0 auto;" @click="changeImage">{{ i18n.ts.selectFile }}</MkButton>
					<MkInput v-model="name" pattern="[a-z0-9_]">
						<template #label>{{ i18n.ts.name }}</template>
						<template #caption>{{ i18n.ts.emojiNameValidation }}</template>
					</MkInput>
					<MkInput v-model="category" :datalist="customEmojiCategories">
						<template #label>{{ i18n.ts.category }}</template>
					</MkInput>
					<MkInput v-model="aliases">
						<template #label>{{ i18n.ts.tags }}</template>
						<template #caption>{{ i18n.ts.setMultipleBySeparatingWithSpace }}</template>
					</MkInput>
					<MkInput v-model="license">
						<template #label>{{ i18n.ts.license }}</template>
					</MkInput>
					<MkFolder v-if="!isRequest">
						<template #label>{{ i18n.ts.rolesThatCanBeUsedThisEmojiAsReaction }}</template>
						<template #suffix>{{ rolesThatCanBeUsedThisEmojiAsReaction.length === 0 ? i18n.ts.all :
							rolesThatCanBeUsedThisEmojiAsReaction.length }}</template>

						<div class="_gaps">
							<MkButton rounded @click="addRole"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>

							<div v-for="role in rolesThatCanBeUsedThisEmojiAsReaction" :key="role.id"
								:class="$style.roleItem">
								<MkRolePreview :class="$style.role" :role="role" :forModeration="true" :detailed="false"
									style="pointer-events: none;" />
								<button v-if="role.target === 'manual'" class="_button" :class="$style.roleUnassign"
									@click="removeRole(role, $event)"><i class="ti ti-x"></i></button>
								<button v-else class="_button" :class="$style.roleUnassign" disabled><i
										class="ti ti-ban"></i></button>
							</div>

							<MkInfo>{{ i18n.ts.rolesThatCanBeUsedThisEmojiAsReactionEmptyDescription }}</MkInfo>
							<MkInfo warn>{{ i18n.ts.rolesThatCanBeUsedThisEmojiAsReactionPublicRoleWarn }}</MkInfo>
						</div>
					</MkFolder>
					<MkSelect v-if="!isRequest" v-model="status">
						<template #label>{{ i18n.ts._emojis.status }}</template>
						<option value="DRAFT">{{ i18n.ts._emojis.draft }}</option>
						<option value="APPROVED">{{ i18n.ts._emojis.approved }}</option>
						<option value="REJECTED">{{ i18n.ts._emojis.rejected }}</option>
					</MkSelect>
					<MkSwitch v-model="isSensitive">{{ i18n.ts.isSensitive }}</MkSwitch>
					<MkSwitch v-model="localOnly">{{ i18n.ts.localOnly }}</MkSwitch>
					<MkSwitch v-model="approveRequest">{{ i18n.ts._emojis.approveRequest }}</MkSwitch>
				</div>
			</MkSpacer>
			<div :class="$style.footer">
				<div :class="$style.footerButtons">
					<MkButton v-if="props.emoji" danger rounded style="margin: 0 auto;" @click="del()"><i
							class="ti ti-check"></i> {{ i18n.ts.delete }}</MkButton>
					<MkButton v-if="validation" primary rounded style="margin: 0 auto;" @click="done"><i
							class="ti ti-check"></i> {{ props.emoji ? i18n.ts.update : i18n.ts.create }}</MkButton>
					<MkButton v-else rounded style="margin: 0 auto;"><i class="ti ti-check"></i> {{ props.emoji ?
						i18n.ts.update
						: i18n.ts.create }}</MkButton>
				</div>
			</div>
		</div>
	</MkModalWindow>
</template>

<script lang="ts" setup>
import MkButton from "@/components/MkButton.vue";
import MkFolder from "@/components/MkFolder.vue";
import MkInfo from "@/components/MkInfo.vue";
import MkInput from "@/components/MkInput.vue";
import MkModalWindow from "@/components/MkModalWindow.vue";
import MkRolePreview from "@/components/MkRolePreview.vue";
import MkSwitch from "@/components/MkSwitch.vue";
import MkSelect from "./MkSelect.vue";
import { customEmojiCategories } from "@/custom-emojis";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { selectFile } from "@/scripts/select-file";
import * as misskey from "misskey-js";
import { computed, watch, ref } from "vue";

const props = defineProps<{
	emoji?: any;
	isRequest: boolean;
}>();

const dialog = $ref(null);
let name: string = $ref(props.emoji ? props.emoji.name : "");
const category: string = $ref(props.emoji ? props.emoji.category : "");
const aliases: string = $ref(props.emoji ? props.emoji.aliases.join(" ") : "");
const license: string = $ref(props.emoji ? (props.emoji.license ?? "") : "");
const isSensitive = $ref(props.emoji ? props.emoji.isSensitive : false);
const localOnly = $ref(props.emoji ? props.emoji.localOnly : false);
const roleIdsThatCanBeUsedThisEmojiAsReaction = $ref(
	props.emoji ? props.emoji.roleIdsThatCanBeUsedThisEmojiAsReaction : [],
);
let rolesThatCanBeUsedThisEmojiAsReaction = $ref([]);
let file = $ref<misskey.entities.DriveFile>();
const isRequest = $ref(props.isRequest);
const status = ref(props.emoji ? props.emoji.status : "DRAFT");
const approveRequest = ref(props.emoji ? props.emoji.status !== "APPROVED" : false);

watch(
	$$(roleIdsThatCanBeUsedThisEmojiAsReaction),
	async () => {
		if (roleIdsThatCanBeUsedThisEmojiAsReaction) {
			rolesThatCanBeUsedThisEmojiAsReaction = (
				await Promise.all(
					roleIdsThatCanBeUsedThisEmojiAsReaction?.map((id) =>
						os.api("admin/roles/show", { roleId: id }).catch(() => null),
					),
				)
			).filter((x) => x != null);
		}
	},
	{ immediate: true },
);

const imgUrl = computed(() =>
	file ? file.url : props.emoji ? props.emoji.url : null,
);
const validation = computed(() => {
	return name.match(/^[a-zA-Z0-9_]+$/) && imgUrl.value != null;
});

const emit = defineEmits<{
	(ev: "done", v: { deleted?: boolean; updated?: any; created?: any }): void;
	(ev: "closed"): void;
}>();

async function changeImage(ev) {
	file = await selectFile(ev.currentTarget ?? ev.target, null);
	const candidate = file.name.replace(/\.(.+)$/, "");
	if (candidate.match(/^[a-z0-9_]+$/)) {
		name = candidate;
	}
}

async function addRole() {
	const roles = await os.api("admin/roles/list");
	const currentRoleIds = rolesThatCanBeUsedThisEmojiAsReaction.map((x) => x.id);

	const { canceled, result: role } = await os.select({
		items: roles
			.filter((r) => r.isPublic)
			.filter((r) => !currentRoleIds.includes(r.id))
			.map((r) => ({ text: r.name, value: r })),
	});
	if (canceled) return;

	rolesThatCanBeUsedThisEmojiAsReaction.push(role);
}

async function removeRole(role, ev) {
	rolesThatCanBeUsedThisEmojiAsReaction =
		rolesThatCanBeUsedThisEmojiAsReaction.filter((x) => x.id !== role.id);
}

async function done() {
	const params = {
		name,
		category: category === "" ? null : category,
		aliases: aliases
			.replace("　", " ")
			.split(" ")
			.filter((x) => x !== ""),
		license: license === "" ? null : license,
		isSensitive,
		localOnly,
		roleIdsThatCanBeUsedThisEmojiAsReaction:
			rolesThatCanBeUsedThisEmojiAsReaction.map((x) => x.id),
		status: isRequest ? approveRequest.value ? "DRAFT" : "APPROVED" : status.value,
	};

	if (file) {
		params.fileId = file.id;
	}

	if (props.emoji) {
		if (isRequest) {
			// リジェクトされた絵文字を再申請する場合、ステータスを強制的にドラフトにする
			if (props.emoji.status === "REJECTED") {
				params.status = "DRAFT";
			}

			await os.apiWithDialog("admin/emoji/update-draft", {
				id: props.emoji.id,
				...params,
			});
		} else {
			await os.apiWithDialog("admin/emoji/update", {
				id: props.emoji.id,
				...params,
			});
		}

		emit("done", {
			updated: {
				id: props.emoji.id,
				...params,
			},
		});

		dialog.close();
	} else {
		const created = isRequest
			? await os.apiWithDialog("admin/emoji/add-draft", params)
			: await os.apiWithDialog("admin/emoji/add", params);

		emit("done", {
			created: created,
		});

		dialog.close();
	}
}

async function del() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("removeAreYouSure", { x: name }),
	});
	if (canceled) return;

	os.api("admin/emoji/delete", {
		id: props.emoji.id,
	}).then(() => {
		emit("done", {
			deleted: true,
		});
		dialog.close();
	});
}
</script>

<style lang="scss" module>
.imgs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}

.imgContainer {
	padding: 8px;
	border-radius: 6px;
}

.img {
	display: block;
	height: 64px;
	width: 128px;
	object-fit: contain;
}

.roleItem {
	display: flex;
}

.role {
	flex: 1;
}

.roleUnassign {
	width: 32px;
	height: 32px;
	margin-left: 8px;
	align-self: center;
}

.footer {
	position: sticky;
	bottom: 0;
	left: 0;
	padding: 12px;
	border-top: solid 0.5px var(--divider);
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}

.footerButtons {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
