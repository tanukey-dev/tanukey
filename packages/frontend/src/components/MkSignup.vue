<template>
	<Transition mode="out-in" :enterActiveClass="$style.transition_x_enterActive"
		:leaveActiveClass="$style.transition_x_leaveActive" :enterFromClass="$style.transition_x_enterFrom"
		:leaveToClass="$style.transition_x_leaveTo">
		<template v-if="!isAcceptedServerRule">
			<XServerRules @done="isAcceptedServerRule = true" @cancel="onCancel" />
		</template>
		<template v-else>
			<XSignup :autoSet="autoSet" @signup="onSignup" @signupEmailPending="onSignupEmailPending" />
		</template>
	</Transition>
</template>

<script lang="ts" setup>
import XSignup from "@/components/MkSignupDialog.form.vue";
import XServerRules from "@/components/MkSignupDialog.rules.vue";
import { } from "vue";

const props = withDefaults(
	defineProps<{
		autoSet?: boolean;
	}>(),
	{
		autoSet: false,
	},
);

const emit = defineEmits<{
	(ev: "done"): void;
	(ev: "cancel"): void;
	(ev: "closed"): void;
}>();

const isAcceptedServerRule = $ref(false);

function onCancel() {
	emit("cancel");
}

function onSignup() {
	emit("done");
}

function onSignupEmailPending() {
}
</script>

<style lang="scss" module>
.transition_x_enterActive,
.transition_x_leaveActive {
	transition: opacity 0.3s cubic-bezier(0, 0, .35, 1), transform 0.3s cubic-bezier(0, 0, .35, 1);
}

.transition_x_enterFrom {
	opacity: 0;
	transform: translateX(50px);
}

.transition_x_leaveTo {
	opacity: 0;
	transform: translateX(-50px);
}
</style>
