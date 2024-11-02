<template>
    <v-app>
        <BaseUi />
    </v-app>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from "vue";
import { $i } from "./account";

const BaseUi = new URLSearchParams(window.location.search).has("zen")
    ? defineAsyncComponent(() => import("@/ui/zen.vue"))
    : !$i
        ? defineAsyncComponent(() => import("@/ui/visitor.vue"))
        : defineAsyncComponent(() => import("@/ui/universal.vue"));
</script>

<style lang="scss" module></style>
