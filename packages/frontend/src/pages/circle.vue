<template>
	<KeepAlive>
		<MkStickyContainer>
			<template #header>
				<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
			</template>
			<MkSpacer :contentMax="700" :class="$style.main">
				<div v-if="circle && tab === 'overview'" class="_gaps">
					<template v-if="page">
						<XPage :page="page" />
					</template>
				</div>
			</MkSpacer>
			<template #footer>
				<div :class="$style.footer">
				</div>
			</template>
		</MkStickyContainer>
	</KeepAlive>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import * as misskey from "misskey-js";
import * as os from "@/os";
import XPage from "@/components/page/page.vue";
import { useRouter } from "@/router";
import { $i, iAmModerator } from "@/account";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { url } from "@/config";

const router = useRouter();

const props = defineProps<{
	circleId: string;
}>();

let tab = $ref("overview");
let circle = $ref<null | misskey.entities.Channel>(null);
let page = $ref(null);

watch(
	() => props.circleId,
	async () => {
		circle = await os.api("circles/show", {
			circleId: props.circleId,
		});

		page = await os.api("pages/show", {
			pageId: circle.pageId,
		});
	},
	{ immediate: true },
);

function edit() {
	router.push(`/secure/circles/${circle.id}/edit`);
}

const headerActions = $computed(() => {
	if (circle && circle.userId) {
		const share = {
			icon: "ti ti-share",
			text: i18n.ts.share,
			handler: async (): Promise<void> => {
				navigator.share({
					title: circle.name,
					text: circle.description,
					url: `${url}/circles/${circle.id}`,
				});
			},
		};

		const canEdit = ($i && $i.id === circle.userId) || iAmModerator;
		return canEdit
			? [
				share,
				{
					icon: "ti ti-settings",
					text: i18n.ts.edit,
					handler: edit,
				},
			]
			: [share];
	} else {
		return null;
	}
});

const headerTabs = $computed(() => [
	{
		key: "overview",
		title: i18n.ts.overview,
		icon: "ti ti-info-circle",
	},
]);

definePageMetadata(
	computed(() =>
		circle
			? {
				title: circle.name,
				icon: "ti ti-circles-relation",
			}
			: null,
	),
);
</script>

<style lang="scss" module>
.main {
	min-height: calc(100cqh - (var(--stickyTop, 0px) + var(--stickyBottom, 0px)));
}

.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	border-top: solid 0.5px var(--divider);
}

.bannerContainer {
	position: relative;
}

.subscribe {
	position: absolute;
	z-index: 1;
	top: 16px;
	left: 16px;
}

.favorite {
	position: absolute;
	z-index: 1;
	top: 16px;
	right: 16px;
}

.banner {
	display: flex;
	justify-content: center;
	height: 300px;
}

.bannerImage {
	width: 100%;
	object-fit: contain;
}

.bannerName {
	font-size: 1.2em;
}

.bannerFade {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 64px;
	background: linear-gradient(0deg, var(--panel), var(--X15));
}

.bannerStatus {
	position: absolute;
	z-index: 1;
	bottom: 16px;
	right: 16px;
	padding: 8px 12px;
	font-size: 80%;
	background: rgba(0, 0, 0, 0.7);
	border-radius: 6px;
	color: #fff;
}

.description {
	padding: 16px;
}
</style>
