<template>
<MkA :to="`/events/${eventCircle.eventId}/${eventCircle.id}`" class="eftoefju _panel" tabindex="-1">
	<div class="banner" :style="bannerStyle">
		<div class="fade"></div>
		<div class="name"><i class="ti ti-calendar-event"></i> {{ circle?.name }}</div>
		<!-- <div class="status"></div> -->
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

const bannerStyle = computed(() => {
	if (props.eventCircle.circleImageUrl) {
		return { backgroundImage: `url(${props.eventCircle.circleImageUrl})` };
	} else {
		return { backgroundColor: '#4c5e6d' };
	}
});
</script>

<style lang="scss" scoped>
.eftoefju {
	display: block;
	overflow: hidden;
	width: 100%;

	&:hover {
		text-decoration: none;
	}

	> .banner {
		position: relative;
		width: 100%;
		height: 200px;
		background-position: center;
		background-size: cover;

		> .fade {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 64px;
			background: linear-gradient(0deg, var(--panel), var(--X15));
		}

		> .name {
			position: absolute;
			top: 16px;
			left: 16px;
			padding: 12px 16px;
			background: rgba(0, 0, 0, 0.7);
			color: #fff;
			font-size: 1.2em;
		}

		> .status {
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
