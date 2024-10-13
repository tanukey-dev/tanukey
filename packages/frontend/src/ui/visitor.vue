<template>
	<div class="mk-app">
		<div v-if="!narrow && !root" class="side">
			<div class="banner"
				:style="{ backgroundImage: instance.backgroundImageUrl ? `url(${instance.backgroundImageUrl})` : 'none' }">
			</div>
			<div class="dashboard">
				<MkVisitorDashboard />
			</div>
		</div>

		<div class="main">
			<div class="contents">
				<main v-if="!root" style="container-type: inline-size;">
					<Suspense>
						<router-view />
					</Suspense>
				</main>
				<main v-else>
					<Suspense>
						<router-view />
					</Suspense>
				</main>
			</div>
			<div v-if="!root" class="footer">
				<div v-if="narrow === true" class="narrow">
					<button class="_buttonPrimary" @click="signup()">{{ i18n.ts.signup }}</button>
					<button class="_button" @click="signin()">{{ i18n.ts.login }}</button>
				</div>
			</div>
		</div>
	</div>
	<XCommon />
</template>

<script lang="ts" setup>
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkVisitorDashboard from "@/components/MkVisitorDashboard.vue";
import { instanceName } from "@/config";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import * as os from "@/os";
import { router } from "@/router";
import { PageMetadata, provideMetadataReceiver } from "@/scripts/page-metadata";
import { ComputedRef, onMounted, provide } from "vue";
import XCommon from "./_common_/common.vue";

const DESKTOP_THRESHOLD = 1100;

let pageMetadata = $ref<null | ComputedRef<PageMetadata>>();

provide("router", router);
provideMetadataReceiver((info) => {
	pageMetadata = info;
	if (pageMetadata.value) {
		document.title = `${pageMetadata.value.title} | ${instanceName}`;
	}
});

let showMenu = $ref(false);
let isDesktop = $ref(window.innerWidth >= DESKTOP_THRESHOLD);
let narrow = $ref(window.innerWidth < 1280);
let meta = $ref();

const root = $computed(() => ["/", "/signin", "/signup"].includes(router.currentRoute.value.path));

os.api("meta", { detail: true }).then((res) => {
	meta = res;
});

function signin() {
	os.popup(
		XSigninDialog,
		{
			autoSet: true,
		},
		{},
		"closed",
	);
}

function signup() {
	os.popup(
		XSignupDialog,
		{
			autoSet: true,
		},
		{},
		"closed",
	);
}

onMounted(() => {
	if (!isDesktop) {
		window.addEventListener(
			"resize",
			() => {
				if (window.innerWidth >= DESKTOP_THRESHOLD) isDesktop = true;
			},
			{ passive: true },
		);
	}
});

defineExpose({
	showMenu: $$(showMenu),
});
</script>

<style lang="scss" scoped>
.tray-enter-active,
.tray-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.tray-enter-from,
.tray-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.tray-back-enter-active,
.tray-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.tray-back-enter-from,
.tray-back-leave-active {
	opacity: 0;
}

.mk-app {
	display: flex;
	min-height: 100vh;

	>.side {
		position: sticky;
		top: 0;
		left: 0;
		width: 500px;
		height: 100vh;
		background: var(--accent);

		>.banner {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			aspect-ratio: 1.5;
			background-position: center;
			background-size: cover;
			-webkit-mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
			mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
		}

		>.dashboard {
			position: relative;
			padding: 32px;
			box-sizing: border-box;
			max-height: 100%;
			overflow: auto;
		}
	}

	>.main {
		flex: 1;
		min-width: 0;
		min-height: 100vh;

		>.contents {
			min-height: 100vh;
		}

		>.footer {
			position: sticky;
			bottom: 0;
			background: var(--header);

			>.wide {
				line-height: 50px;
				padding: 0 16px;

				>.link {
					padding: 0 16px;
				}
			}

			>.narrow {
				padding: 16px;
				display: flex;
				justify-content: center;

				>button {
					width: 40%;
					margin-left: 10px;
					margin-right: 10px;
					padding: 10px;
					box-sizing: border-box;
					text-align: center;
					border-radius: 999px;

					&._button {
						background: var(--buttonBg);
					}
				}
			}
		}
	}
}
</style>
