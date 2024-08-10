<template>
<MkA :to="`/events/${event.id}`" class="eftoefju _panel" tabindex="-1">
	<div class="name"><i class="ti ti-calendar-event"></i> {{ event.name }}</div>
	<div class="banner">
		<img :src="props.event.bannerUrl ?? 'https://ostanukey.tarbin.net/assets/noImage.png'" class="bannerImage">
	</div>
	<article v-if="event.description">
		<p :title="event.description">{{ event.description.length > 85 ? event.description.slice(0, 85) + '…' : event.description }}</p>
	</article>
</MkA>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n';

const props = defineProps<{
	event: Record<string, any>;
}>();
</script>

<style lang="scss" scoped>
.eftoefju {
	display: block;
	overflow: hidden;
	width: 100%;

	&:hover {
		text-decoration: none;
	}

	> .name {
		padding: 12px 16px;
		font-size: 1.2em;
	}

	> .banner {
		display: flex;
		justify-content: center;
		height: 300px;

		> .bannerImage {
			width: 100%;
			object-fit: contain;
		}
	}

	> article {
		padding: 16px;

		> p {
			margin: 0;
			font-size: 1em;
		}
	}

	> footer {
		padding: 12px 16px;
		border-top: solid 0.5px var(--divider);

		> span {
			opacity: 0.7;
			font-size: 0.9em;
		}
	}

	@media (max-width: 550px) {
		font-size: 0.9em;

		> .banner {
			height: 80px;

			> .status {
				display: none;
			}
		}

		> article {
			padding: 12px;
		}

		> footer {
			display: none;
		}
	}

	@media (max-width: 500px) {
		font-size: 0.8em;

		> .banner {
			height: 70px;
		}

		> article {
			padding: 8px;
		}
	}
}

</style>
