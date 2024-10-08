<template>
	<div v-if="meta" :class="$style.root">
		<img v-if="meta.bannerUrl" :class="$style.banner" :src="meta.bannerUrl">
		<div :class="$style.catchcopy">
			<div v-if="host === 'novelskey.tarbin.net' || host === 'dev.tarbin.net'">本が好きなひとたちと、雑談できるSNS</div>
		</div>
		<div :class="$style.catchcopy">
			<div v-if="host === 'otoskey.tarbin.net' || host === 'dev.tarbin.net'">音が好きなひとたちと、雑談できるSNS</div>
		</div>
		<div :class="$style.buttons">
			<MkButton :class="$style.button" rounded gradate data-cy-signup @click="signup()">{{
				i18n.ts.joinThisServer }}</MkButton>
			<MkButton :class="$style.button" rounded data-cy-signin @click="signin()">{{ i18n.ts.login }}
			</MkButton>
		</div>
		<div v-if="host === 'novelskey.tarbin.net' || host === 'dev.tarbin.net'" :class="$style.mainDescription">
			<div :class="[$style.mainDescriptionItem, $style.panel]">
				<div :class="$style.headerText">ノベルスキーとは</div>
				<img :class="[$style.descriptionImage, $style.panelImg]"
					src="https://ostanukey.tarbin.net/assets/Novelskey_logo_B_4c.png">
				<div :class="$style.mainText">
					<p>ノベルスキーは、作家・字書きや、小説など文字が好きな人のためのコミュニティです。</p>
				</div>
			</div>
		</div>
		<div v-if="host === 'otoskey.tarbin.net' || host === 'dev.tarbin.net'" :class="$style.mainDescription">
			<div :class="[$style.mainDescriptionItem, $style.panel]">
				<div :class="$style.headerText">おとすきーとは</div>
				<img :class="[$style.descriptionImage, $style.panelImg]"
					src="https://ostanukey.tarbin.net/assets/Otoskey.png">
				<div :class="$style.mainText">
					<p>おとすきーは、音楽が好きな人や音楽関係の創作者のためのコミュニティです。</p>
				</div>
			</div>
		</div>
		<div :class="$style.mainDescription">
			<div :class="[$style.mainDescriptionItem, $style.panel]">
				<div :class="$style.headerText">ActivityPubに対応した分散型SNS</div>
				<img :class="[$style.descriptionImage, $style.panelImg]"
					src="https://ostanukey.tarbin.net/assets/landing-fediverse.png">
				<div :class="$style.mainText">
					<p>Misskey fork の Tanukey を利用した分散型SNSサービスで ActivityPub に対応しており、Mastodon,
						MisskeyなどのActivityPubに対応した他のSNSと相互にメッセージのやりとりが可能です。</p>
				</div>
			</div>
		</div>
		<div :class="$style.mainDescription">
			<div :class="[$style.mainDescriptionItem, $style.panel]">
				<div :class="$style.headerText">OpenSearchを利用した高速な検索</div>
				<img :class="[$style.descriptionImage, $style.panelImg]"
					src="https://ostanukey.tarbin.net/assets/opensearch_logo_default.png">
				<div :class="$style.mainText">
					<p>OpenSearchを利用しており、Fediverse内に投稿されたノートの高速な検索が可能です。</p>
				</div>
			</div>
		</div>
		<div :class="$style.mainDescription">
			<div :class="[$style.mainDescriptionItem, $style.panel]">
				<div :class="$style.headerText">公開タイムラインを見てみる</div>
				<div :class="$style.tlBody">
					<MkTimeline src="local" />
				</div>
			</div>
		</div>
	</div>
	<div :class="$style.footer">
		<div>© 2024 Novelskey / Otoskey Project</div>
	</div>
</template>

<script lang="ts" setup>
import MkButton from "@/components/MkButton.vue";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import MkTimeline from "@/components/MkTimeline.vue";
import { host } from "@/config";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { DetailedInstanceMetadata } from "misskey-js/built/entities";

let meta = $ref<DetailedInstanceMetadata>();

os.api("meta", { detail: true }).then((_meta) => {
	meta = _meta;
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

</script>

<style lang="scss" module>
@import 'https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;500;600;700;900&display=swap';
@import 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap';

.root {
	background-color: var(--bg);
	padding-bottom: 40px;
}

.panel {
	background: var(--panel);
	border-radius: var(--radius);
	padding: 20px;
}

.panelImg {
	background: rgb(255, 255, 255);
	border-radius: var(--radius);
	padding: 20px;
}

.banner {
	width: 100%;
	-webkit-mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 15%);
	mask-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 15%);
}

.catchcopy {
	display: flex;
	justify-content: center;
	text-align: center;
	padding-top: 30px;
	padding-left: 10px;
	padding-right: 10px;
	font-size: xx-large;
	line-height: 1.4;

	font-family: "Zen Old Mincho", serif;
	font-weight: 400;
	font-style: normal;
}

.buttons {
	padding-top: 30px;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}

.button {
	width: 200px;
	margin-top: 5px;
	margin-bottom: 5px;
	margin-right: 5px;
	margin-left: 5px;
}

.mainDescription {
	display: flex;
	justify-content: center;
	padding-top: 30px;
}

.mainDescriptionItem {
	width: 800px;
}

.headerText {
	font-size: x-large;
	text-align: center;
	padding-top: 10px;
	padding-bottom: 10px;
	line-height: 1.4;

	font-family: "Noto Sans JP", sans-serif;
	font-weight: 400;
	font-style: normal;
}

.mainText {
	font-size: medium;
	text-align: center;
	line-height: 1.4;

	font-family: "Noto Sans JP", sans-serif;
	font-weight: 400;
	font-style: normal;
}

.footer {
	background-color: var(--bg);
	display: flex;
	justify-content: center;
	padding-top: 20px;
	padding-bottom: 20px;
}

.descriptionImage {
	width: 60%;
	margin: auto;
	display: block
}

.tlBody {
	height: 350px;
	overflow: auto;
}
</style>