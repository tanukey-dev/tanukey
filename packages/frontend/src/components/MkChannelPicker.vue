<template>
<MkModal ref="modal" v-slot="{ type }" :zPriority="'high'" :src="src" @click="modal.close()" @closed="emit('closed')">
	<div class="_popup" :class="{ [$style.root]: true, [$style.asDrawer]: type === 'drawer' }">
		<div :class="[$style.label, $style.item]">
			{{ i18n.ts.channel }}
		</div>
		<button key="public" class="_button" :class="[$style.item, { [$style.active]: ch === null }]" data-index="1" @click="choose(null)">
			<div :class="$style.icon"><i class="ti ti-device-tv-off"></i></div>
			<div :class="$style.body">
				<span :class="$style.itemTitle">{{ i18n.ts._visibility.public }}</span>
			</div>
		</button>
		<template v-for="channel in channels" :key="channel.id">
			<button class="_button" :class="[$style.item, { [$style.active]: channel.id === ch?.id }]" data-index="1" @click="choose(channel.data)">
				<div :class="$style.icon"><i :class="channel.icon"></i></div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{ channel.name }}</span>
				</div>
			</button>
		</template>
		<MkLoading v-if="loading"/>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import * as misskey from 'misskey-js';
import { instance } from '@/instance';
import * as os from '@/os';
import { defaultStore } from '@/store';
import MkModal from '@/components/MkModal.vue';
import { i18n } from '@/i18n';

const modal = $shallowRef<InstanceType<typeof MkModal>>();
const channels = ref<any[]>([]);
const loading = ref<boolean>(true);

const props = withDefaults(defineProps<{
	currentChannel: misskey.entities.Channel | null;
	src?: HTMLElement;
}>(), {
});

onMounted(async () => {
	loading.value = true;

	let t: any[] = [];
	let ids: string[] = [];
	let s: Set<string> = new Set<string>();

	for (let id of instance.pinnedLtlChannelIds) {
		ids.push(id);
		s.add(id);
	}

	let userPinnedLtlChannelIds = defaultStore.makeGetterSetter('userPinnedLtlChannelIds');
	let userPinnedChIds = userPinnedLtlChannelIds.get();
	for (let id of userPinnedChIds) {
		if (!s.has(id.value)) {
			ids.push(id.value);
			s.add(id.value);
		}
	}

	let pinnedChs = await os.api('channels/show', {
		channelIds: ids,
	});

	if (pinnedChs) {
		for (let ch of pinnedChs) {
			if (ch != null) {
				if (ch.isVoiceChatEnabled) {
					t.push({ id: ch.id, name: ch.name, icon: 'ti ti-microphone', data: ch });
				} else {
					if (instance.pinnedLtlChannelIds.includes(ch.id)) {
						t.push({ id: ch.id, name: ch.name, icon: 'ti ti-device-tv-old', data: ch });
					} else {
						t.push({ id: ch.id, name: ch.name, icon: 'ti ti-device-tv', data: ch });
					}
				}
			}
		}
	}

	let favorites = await os.api('channels/my-favorites', {});
	for (let ch of favorites) {
		if (!s.has(ch.id)) {
			t.push({ id: ch.id, name: ch.name, icon: 'ti ti-microphone', data: ch });
			s.add(ch.id);
		}
	}

	let vchs = await os.api('channels/voice-channels', {});
	if (vchs) {
		for (let ch of vchs) {
			if (!s.has(ch.id)) {
				t.push({ id: ch.id, name: ch.name, icon: 'ti ti-microphone', data: ch });
				s.add(ch.id);
			}
		}
	}

	channels.value = t;

	loading.value = false;
});

const emit = defineEmits<{
	(ev: 'changeChannel', channel: misskey.entities.Channel|null): void;
	(ev: 'closed'): void;
}>();

let ch = $ref(props.currentChannel);

function choose(channel: misskey.entities.Channel|null): void {
	ch = channel;
	emit('changeChannel', channel);
	nextTick(() => {
		if (modal) modal.close();
	});
}
</script>

<style lang="scss" module>
.root {
	min-width: 240px;
	padding: 8px 0;

	&.asDrawer {
		padding: 12px 0 max(env(safe-area-inset-bottom, 0px), 12px) 0;
		width: 100%;
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;

		.label {
			pointer-events: none;
			font-size: 12px;
			padding-bottom: 4px;
			opacity: 0.7;
		}

		.item {
			font-size: 14px;
			padding: 10px 24px;
		}
	}
}

.label {
	pointer-events: none;
	font-size: 10px;
	padding-bottom: 4px;
	opacity: 0.7;
}

.item {
	display: flex;
	padding: 8px 14px;
	font-size: 12px;
	text-align: left;
	width: 100%;
	box-sizing: border-box;

	&:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	&:active {
		background: rgba(0, 0, 0, 0.1);
	}

	&.active {
		color: var(--accent);
	}
}

.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 10px;
	width: 16px;
	top: 0;
	bottom: 0;
	margin-top: auto;
	margin-bottom: auto;
}

.body {
	flex: 1 1 auto;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.itemTitle {
	display: block;
	font-weight: bold;
}

.itemDescription {
	opacity: 0.6;
}
</style>
