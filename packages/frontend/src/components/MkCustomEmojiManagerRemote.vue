<template>
<FormSplit>
	<MkInput v-model="queryRemote" :debounce="true" type="search">
		<template #prefix><i class="ti ti-search"></i></template>
		<template #label>{{ i18n.ts.search }}</template>
	</MkInput>
	<MkInput v-model="host" :debounce="true">
		<template #label>{{ i18n.ts.host }}</template>
	</MkInput>
</FormSplit>
<MkPagination :pagination="remotePagination" :displayLimit="100">
	<template #empty><span>{{ i18n.ts.noCustomEmojis }}</span></template>
	<template #default="{items}">
		<div class="ldhfsamy">
			<div v-for="emoji in items" :key="emoji.id" class="emoji _panel _button" @click="remoteMenu(emoji, $event)">
				<img :src="emoji.url" class="img" :alt="emoji.name"/>
				<div class="body">
					<div class="name _monospace">{{ emoji.name }}</div>
					<div class="info">{{ emoji.host }}</div>
				</div>
			</div>
		</div>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkPagination from '@/components/MkPagination.vue';
import FormSplit from '@/components/form/split.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

const queryRemote = ref(null);
const host = ref(null);

const remotePagination = {
	endpoint: 'admin/emoji/list-remote' as const,
	limit: 30,
	params: computed(() => ({
		query: (queryRemote.value && queryRemote.value !== '') ? queryRemote.value : null,
		host: (host.value && host.value !== '') ? host.value : null,
	})),
};

const im = (emoji) => {
	os.apiWithDialog('admin/emoji/copy', {
		emojiId: emoji.id,
	});
};

const remoteMenu = (emoji, ev: MouseEvent) => {
	os.popupMenu([{
		type: 'label',
		text: ':' + emoji.name + ':',
	}, {
		text: i18n.ts.import,
		icon: 'ti ti-plus',
		action: () => { im(emoji); },
	}], ev.currentTarget ?? ev.target);
};
</script>

<style lang="scss" scoped>
.empty {
	margin: var(--margin);
}

.ldhfsamy {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
	grid-gap: 12px;
	margin: var(--margin) 0;

	> .emoji {
		display: flex;
		align-items: center;
		padding: 12px;
		text-align: left;

		&:hover {
			color: var(--accent);
		}

		> .img {
			width: 32px;
			height: 32px;
		}

		> .body {
			padding: 0 0 0 8px;
			white-space: nowrap;
			overflow: hidden;

			> .name {
				text-overflow: ellipsis;
				overflow: hidden;
			}

			> .info {
				opacity: 0.5;
				font-size: 90%;
				text-overflow: ellipsis;
				overflow: hidden;
			}
		}
	}
}
</style>
