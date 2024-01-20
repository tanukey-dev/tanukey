<template>
<MkA :to="`/events/${eventCircle.eventId}/${eventCircle.id}`" class="eftoefju _panel" tabindex="-1">
	<div class="name"><i class="ti ti-calendar-event"></i> {{ circle?.name }}</div>
	<div class="banner">
		<img :src="circle.profileImageUrl ?? 'https://ostanukey.tanukey.chat/assets/noImage.png'" class="bannerImage">
	</div>
	<article v-if="eventCircle.description">
		<p :title="eventCircle.description">{{ eventCircle.description.length > 85 ? eventCircle.description.slice(0, 85) + '…' : eventCircle.description }}</p>
	</article>
	<!-- <footer>
	</footer> -->
</MkA>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { i18n } from '@/i18n';
import * as os from '@/os';

const props = defineProps<{
	eventCircle: Record<string, any>;
}>();

let circle = $ref(null); 

async function fetch() {
	if (props.eventCircle.circleId) {
		circle = await os.api('circles/show', {
			circleId: props.eventCircle.circleId,
		});
	}
}

fetch();
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
