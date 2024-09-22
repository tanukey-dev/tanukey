<script lang="ts">
import { VNode, defineComponent, h, ref, watch } from "vue";
import MkRadio from "./MkRadio.vue";

export default defineComponent({
	props: ["modelValue"],
	emits: ["update:modelValue"],
	setup(props, context) {
		if (!context.slots.default) return null;
		let options = context.slots.default();
		const label = context.slots.label && context.slots.label();
		const caption = context.slots.caption && context.slots.caption();

		// なぜかFragmentになることがあるため
		if (options.length === 1 && options[0].props == null)
			options = options[0].children as VNode[];

		return () =>
			h(
				"div",
				{
					class: "novjtcto",
				},
				[
					...(label
						? [
								h(
									"div",
									{
										class: "label",
									},
									label,
								),
							]
						: []),
					h(
						"div",
						{
							class: "body",
						},
						options.map((option) =>
							h(
								MkRadio,
								{
									key: option.key,
									value: option.props?.value,
									modelValue: props.modelValue,
									"onUpdate:modelValue": (_v) =>
										context.emit("update:modelValue", _v),
								},
								() => option.children,
							),
						),
					),
					...(caption
						? [
								h(
									"div",
									{
										class: "caption",
									},
									caption,
								),
							]
						: []),
				],
			);
	},
});
</script>

<style lang="scss">
.novjtcto {
	> .label {
		font-size: 0.85em;
		padding: 0 0 8px 0;
		user-select: none;

		&:empty {
			display: none;
		}
	}

	> .body {
		display: flex;
    gap: 12px;
    flex-wrap: wrap;
	}

	> .caption {
		font-size: 0.85em;
		padding: 8px 0 0 0;
		color: var(--fgTransparentWeak);

		&:empty {
			display: none;
		}
	}
}
</style>
