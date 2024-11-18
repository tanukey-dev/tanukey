<template>
    <v-app :style="`font-size: ${fontSize}px;`">
        <BaseUi />
    </v-app>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed } from "vue";
import { $i } from "./account";
import { defaultStore } from "@/store";

const fontSize = computed(
    defaultStore.makeGetterSetter("fontSize"),
);

const subBootPaths = ["/share", "/auth", "/miauth"];

const BaseUi = new URLSearchParams(window.location.search).has("zen")
    || window.location.pathname.startsWith("/share")
    || window.location.pathname.startsWith("/auth")
    || window.location.pathname.startsWith("/miauth")
    ? defineAsyncComponent(() => import("@/ui/zen.vue"))
    : !$i
        ? defineAsyncComponent(() => import("@/ui/visitor.vue"))
        : defineAsyncComponent(() => import("@/ui/universal.vue"));
</script>

<style lang="scss" module></style>
