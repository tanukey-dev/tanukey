<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div style="overflow: clip;">
		<MkSpacer :contentMax="600" :marginMin="20">
			<div class="_gaps_m znqjceqz">
				<div v-panel class="about">
					<div ref="containerEl" class="container" :class="{ playing: easterEggEngine != null }">
						<img src="/client-assets/about-icon.png" alt="" class="icon" draggable="false" @load="iconLoaded" @click="gravity"/>
						<div class="misskey">Tanukey</div>
						<div class="version">v{{ version }}</div>
						<span v-for="emoji in easterEggEmojis" :key="emoji.id" class="emoji" :data-physics-x="emoji.left" :data-physics-y="emoji.top" :class="{ _physics_circle_: !emoji.emoji.startsWith(':') }">
							<MkCustomEmoji v-if="emoji.emoji[0] === ':'" class="emoji" :name="emoji.emoji" :normal="true" :noStyle="true"/>
							<MkEmoji v-else class="emoji" :emoji="emoji.emoji" :normal="true" :noStyle="true"/>
						</span>
					</div>
					<button v-if="thereIsTreasure" class="_button treasure" @click="getTreasure"><img src="/fluent-emoji/1f3c6.png" class="treasureImg"></button>
				</div>
				<div style="text-align: center;">
					{{ i18n.ts._aboutTanukey.about }}<br>
				</div>
				<div v-if="$i != null" style="text-align: center;">
					<MkButton primary rounded inline @click="iLoveTanukey">I <Mfm text="$[jelly ❤]"/> #Tanukey</MkButton>
				</div>
				<FormSection>
					<div class="_formLinks">
						<FormLink to="https://github.com/tar-bin/tanukey" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts._aboutTanukey.source }}
							<template #suffix>GitHub</template>
						</FormLink>
						<FormLink to="https://crowdin.com/project/tanukey" external>
							<template #icon><i class="ti ti-language-hiragana"></i></template>
							{{ i18n.ts._aboutTanukey.translation }}
							<template #suffix>Crowdin</template>
						</FormLink>
						<FormLink to="https://tar-bin.fanbox.cc/" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							{{ i18n.ts._aboutTanukey.donate }}
							<template #suffix>Pixiv Fanbox</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<template #label><Mfm text="$[jelly ❤]"/> {{ i18n.ts._aboutTanukey.patrons }}</template>
					<div :class="$style.patronsWithIcon">
						<div v-for="patron in patronsWithIcon" :class="$style.patronWithIcon">
							<img :src="patron.icon" :class="$style.patronIcon">
							<span :class="$style.patronName">{{ patron.name }}</span>
						</div>
					</div>
					<div style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); grid-gap: 12px;">
						<div v-for="patron in patrons" :key="patron"><a :href="patron.url" target="_blank" rel="noopener noreferrer">{{ patron.name }}</a></div>
					</div>
					<!-- <p>{{ i18n.ts._aboutTanukey.morePatrons }}</p> -->
				</FormSection>
				<!--
				<FormSection>
					<template #label>Special thanks</template>
					<div style="text-align: center;">
					</div>
				</FormSection>
				-->
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount } from "vue";
import { version } from "@/config";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import MkButton from "@/components/MkButton.vue";
import MkLink from "@/components/MkLink.vue";
import { physics } from "@/scripts/physics";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { claimAchievement, claimedAchievements } from "@/scripts/achievements";
import { $i } from "@/account";

const patronsWithIcon = [];

const patrons = [
	{ name: "峰岸", url: "https://novelskey.tarbin.net/@minegishi_0" },
	{ name: "倭", url: "https://novelskey.tarbin.net/@toyama_waon" },
	{ name: "虚影庵", url: "http://kyoeian.vis.ne.jp" },
	{ name: "=Hatze=", url: "https://cobbitria.net/" },
	{ name: "にいさ", url: "https://novelskey.tarbin.net/@0323_0323" },
	{ name: "熊楠", url: "#" },
	{ name: "のーら", url: "#" },
	{ name: "鹿", url: "#" },
	{ name: "あまがっぱ", url: "https://novelskey.tarbin.net/@amagappa1220" },
	{ name: "のーら", url: "#" },
	{ name: "萩オス", url: "https://hagios0.net" },
	{ name: "カリウム", url: "https://twitter.com/contents_conten" },
	{ name: "鈍兵夢芽", url: "https://novelskey.tarbin.net/@yume_dombay" },
	{ name: "にゃりつぃん", url: "https://novelskey.tarbin.net/@nyaritsin" },
	{ name: "キサラギ職員", url: "https://twitter.com/DSnohito" },
	{ name: "沼崎", url: "#" },
];

let thereIsTreasure = $ref(
	$i && !claimedAchievements.includes("foundTreasure"),
);

let easterEggReady = false;
let easterEggEmojis = $ref([]);
let easterEggEngine = $ref(null);
const containerEl = $shallowRef<HTMLElement>();

function iconLoaded() {
	const emojis = defaultStore.state.reactions;
	const containerWidth = containerEl.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.push({
			id: i.toString(),
			top: -(128 + Math.random() * 256),
			left: Math.random() * containerWidth,
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine = physics(containerEl);
}

function iLoveTanukey() {
	os.post({
		initialText: "I $[jelly ❤] #Tanukey",
		instant: true,
	});
}

function getTreasure() {
	thereIsTreasure = false;
	claimAchievement("foundTreasure");
}

onBeforeUnmount(() => {
	if (easterEggEngine) {
		easterEggEngine.stop();
	}
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.aboutTanukey,
	icon: null,
});
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		border-radius: var(--radius);

		> .treasure {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			margin: 0 auto;
			width: min-content;

			> .treasureImg {
				width: 25px;
				vertical-align: bottom;
			}
		}

		> .container {
			position: relative;
			text-align: center;
			padding: 16px;

			&.playing {
				&, * {
					user-select: none;
				}

				* {
					will-change: transform;
				}

				> .emoji {
					visibility: visible;
				}
			}

			> .icon {
				display: block;
				width: 80px;
				margin: 0 auto;
				border-radius: 16px;
				position: relative;
				z-index: 1;
			}

			> .misskey {
				margin: 0.75em auto 0 auto;
				width: max-content;
				position: relative;
				z-index: 1;
			}

			> .version {
				margin: 0 auto;
				width: max-content;
				opacity: 0.5;
				position: relative;
				z-index: 1;
			}

			> .emoji {
				position: absolute;
				z-index: 1;
				top: 0;
				left: 0;
				visibility: hidden;

				> .emoji {
					pointer-events: none;
					font-size: 24px;
					width: 24px;
				}
			}
		}
	}
}
</style>

<style lang="scss" module>
.contributors {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.contributor {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--buttonBg);
	border-radius: 6px;

	&:hover {
		text-decoration: none;
		background: var(--buttonHoverBg);
	}

	&.active {
		color: var(--accent);
		background: var(--buttonHoverBg);
	}
}

.contributorAvatar {
	width: 30px;
	border-radius: 100%;
}

.contributorUsername {
	margin-left: 12px;
}

.patronsWithIcon {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.patronWithIcon {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--buttonBg);
	border-radius: 6px;
}

.patronIcon {
	width: 24px;
	border-radius: 100%;
}

.patronName {
	margin-left: 12px;
}
</style>
