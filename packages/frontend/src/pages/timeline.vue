<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :display-my-avatar="true"/>
	</template>
	<div ref="rootEl">
		<MkTimelineWithPinedChannel
			v-if="isNeedPinnedChannels()"
			ref="tlComponent"
			:key="src"
			:src="src"
			:sound="true"
		/>
		<MkTimelineWithVoiceChannel
			v-else-if="src === 'voiceChat'"
			ref="tlComponent"
			:key="src"
			:src="src"
			:sound="true"
		/>
		<MkSpacer v-else :contentMax="800" style="padding: 0;">
			<XCommonTimeline
				ref="tlComponent"
				:key="src"
				:src="src"
				:sound="true"
			/>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed, provide, ref } from 'vue';
import type { Tab } from '@/components/global/MkPageHeader.tabs.vue';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';

provide('shouldOmitHeaderTitle', true);

const XCommonTimeline = defineAsyncComponent(() => import('@/components/MkTimelineWithScroll.vue'));
const MkTimelineWithPinedChannel = defineAsyncComponent(() => import('@/components/MkTimelineWithPinedChannel.vue'));
const MkTimelineWithVoiceChannel = defineAsyncComponent(() => import('@/components/MkTimelineWithVoiceChannel.vue'));

function isNeedPinnedChannels(): boolean {
	return src === 'local' || src === 'social';
}

const isLocalTimelineAvailable = ($i == null && instance.policies.ltlAvailable) || ($i != null && $i.policies.ltlAvailable);
const isGlobalTimelineAvailable = ($i == null && instance.policies.gtlAvailable) || ($i != null && $i.policies.gtlAvailable);
const isVoiceChatAvailable = ref(instance.enableVoiceChat);

let srcWhenNotSignin = $ref(isLocalTimelineAvailable ? 'local' : 'global');
const src = $computed({ get: () => ($i ? defaultStore.reactiveState.tl.value.src : srcWhenNotSignin), set: (x) => saveSrc(x) });

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await os.api('users/lists/list');
	const items = lists.map(list => ({
		type: 'link' as const,
		text: list.name,
		to: `/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await os.api('antennas/list');
	const items = antennas.map(antenna => ({
		type: 'link' as const,
		text: antenna.name,
		indicate: antenna.hasUnreadNote,
		to: `/timeline/antenna/${antenna.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseChannel(ev: MouseEvent): Promise<void> {
	const channels = await os.api('channels/my-favorites', {
		limit: 100,
	});
	const items = channels.map(channel => ({
		type: 'link' as const,
		text: channel.name,
		indicate: channel.hasUnreadNote,
		to: `/channels/${channel.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: 'home' | 'local' | 'social' | 'global'): void {
	defaultStore.set('tl', {
		...defaultStore.state.tl,
		src: newSrc,
	});
	srcWhenNotSignin = newSrc;
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'home',
	title: i18n.ts._timelines.home,
	icon: 'ti ti-home',
	iconOnly: true,
}, ...(isLocalTimelineAvailable ? [{
	key: 'local',
	title: i18n.ts._timelines.local,
	icon: 'ti ti-planet',
	iconOnly: true,
}, {
	key: 'social',
	title: i18n.ts._timelines.social,
	icon: 'ti ti-rocket',
	iconOnly: true,
}, {
	key: 'media',
	title: i18n.ts._timelines.media,
	icon: 'ti ti-photo',
	iconOnly: true,
}] : []), ...(isGlobalTimelineAvailable ? [{
	key: 'global',
	title: i18n.ts._timelines.global,
	icon: 'ti ti-whirl',
	iconOnly: true,
}] : []), ...(isVoiceChatAvailable.value ? [{
	key: 'voiceChat',
	title: i18n.ts._timelines.voiceChat,
	icon: 'ti ti-microphone',
	iconOnly: true,
}] : []), {
	icon: 'ti ti-list',
	title: i18n.ts.lists,
	iconOnly: true,
	onClick: chooseList,
}, {
	icon: 'ti ti-antenna',
	title: i18n.ts.antennas,
	iconOnly: true,
	onClick: chooseAntenna,
}, {
	icon: 'ti ti-device-tv',
	title: i18n.ts.channel,
	iconOnly: true,
	onClick: chooseChannel,
}] as Tab[]);

const headerTabsWhenNotLogin = $computed(() => [
	...(isLocalTimelineAvailable ? [{
		key: 'local',
		title: i18n.ts._timelines.local,
		icon: 'ti ti-planet',
		iconOnly: true,
	}] : []),
	...(isGlobalTimelineAvailable ? [{
		key: 'global',
		title: i18n.ts._timelines.global,
		icon: 'ti ti-whirl',
		iconOnly: true,
	}] : []),
] as Tab[]);

definePageMetadata(computed(() => ({
	title: i18n.ts.timeline,
	icon: src === 'local' ? 'ti ti-planet' : src === 'social' ? 'ti ti-rocket' : src === 'global' ? 'ti ti-whirl' : 'ti ti-home',
})));
</script>

<style lang="scss" module>
</style>
