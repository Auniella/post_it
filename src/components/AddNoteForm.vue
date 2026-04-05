<template>
  <q-dialog :ref="myDialog.dialogRef" persistent>
      <q-card class="q-dialog-plugin">
        <q-card-section class="row items-center">
          <q-avatar icon="add" color="primary" text-color="white" size="md" class="q-mr-md" />
          <div class="text-h6">Ajouter une note</div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <q-input
            filled
            v-model="form.title"
            label="Titre de la note"
            :rules="[value => (value && value.trim().length > 0) || 'Le titre est obligatoire']"
            clearable
            autogrow
            style="margin-bottom: 20px;"
          />
          <q-input
            v-model="form.content"
            filled
            label="Contenu de la note"
            :rules="[value => (value && value.trim().length > 0) || 'Le contenu est obligatoire']"
            clearable
            autogrow
            style="margin-top: 20px;"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" flat label="Annuler" @click="myDialog.onDialogCancel" />
          <q-btn color="primary" label="Ajouter" @click="myDialog.onDialogOK(form)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { reactive } from 'vue';
import { useDialogPluginComponent } from 'quasar';
const myDialog = useDialogPluginComponent();
const form = reactive({
  'title': '',
  'content': '',
});

</script>
