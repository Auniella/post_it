<template>
  <q-layout view="hHh lpR fff">

    <q-header elevated class="background-1 text-black myFontTitle">
      <q-toolbar>
        <q-toolbar-title class="flex items-center">
          <q-avatar class="q-mr-xs">
            <q-icon name="sticky_note_2" size="35px"></q-icon>
            <!-- <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" /> -->
          </q-avatar>
          Post-it
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="background-1 text-black myFontTitle">
      <q-toolbar>
        <q-toolbar-title class="flex justify-center items-center" style="font-size: 15px;">
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar> -->
          Made with ❤️ by Auni
        </q-toolbar-title>
        <span style="font-size: 2px; text-align: center;">Je mérite la moyenne non ? Svp les APE<br> Je dois boucher mon 6 de myshop là</span>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>
