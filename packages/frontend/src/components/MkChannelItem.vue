<template>
<MkA :to="`/channels/${channel.id}`" class="eftoefju" tabindex="-1">
	<div class="name">{{ channel.name }}</div>
	<div class="count">{{ channel.notesCount }}</div>
	<div class="time"><MkTime :time="channel.lastNotedAt ?? channel.createdAt"/></div>
</MkA>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n';

const props = defineProps<{
	channel: Record<string, any>;
}>();

</script>

<style lang="scss" scoped>
.eftoefju {
	display: flex;
	flex-wrap: nowrap;
	width: 100%;

	> .name {
		width: 50%;
	}

	> .count {
		width: 25%;
	}

	> .time {
		width: 25%;
	}
}
</style>
