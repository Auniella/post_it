<template>
  <q-page style="padding: 12px;">
    <div>
      <div class="flex justify-between q-mt-lg">
        <div class="myFontTitle text-h4 text-weight-bolder q-mb-md flex items-center">
          <q-icon class="q-mr-md cursor-pointer" name="arrow_back" size="md" @click="() => $router.go(-1)"/>
          Détails de la note
        </div>
        <div class="myBtns flex justify-between">
          <q-btn :color="isEditing ? 'positive' : 'primary'" :icon="isEditing ? 'save' : 'edit'" @click="editClick"><q-tooltip anchor="bottom start" self="center start"> Modifier la note</q-tooltip></q-btn>
          <q-btn color="negative" icon="delete" @click="handleDeleteNote"><q-tooltip anchor="bottom start" self="center start"> Supprimer la note</q-tooltip></q-btn>
          <q-select
            borderless
            v-model="color"
            :style="{backgroundColor: color.value}"
            :options="options"
            label="Couleur de la note"
            class="round-border myFontTitle"
            style="width: 200px; padding: 2px 8px">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="myFontTitle" :style="{ backgroundColor: scope.opt.value }">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:prepend><q-icon name="palette" /></template>
          </q-select>
        </div>
      </div>
      <div v-if="isLoading" class="flex justify-center items-center" style="min-height: 200px;">
        <div class="loaders"></div>
      </div>
      <div v-else-if="fetchError" class="flex justify-center items-center" style="min-height: 200px;">
        <div class="text-negative">
          Erreur lors de la récupération de la note.
        </div>
      </div>
      <div v-else class="shadow-6 relative-position q-pa-md" :style="{ backgroundColor: color.value}">
        <div v-if="note">
          <div v-if="!isEditing" class="myFontTitle text-weight-bold">{{ note.title }}</div>
          <q-input
          v-else
            borderless
            v-model="note.title"
            class="myFontTitle"
            label="Titre de la note"
            :rules="[value => (value && value.trim().length > 0) || 'Le titre est obligatoire']"
            clearable
            autogrow
            style="margin-bottom: 20px;"
          />

          <q-separator class="q-my-md" color="black"></q-separator>
          <div v-if="!isEditing" class="myFontTitle" style="min-height: 50px;">{{ note.content[0] }}</div>
          <!-- <div v-if="!isEditing" class="ellipsis-3-lines" style="min-height: 50px;" v-html="note.content[0]"></div> -->
          <q-input
            v-else
            borderless
            class="myFontTitle"
            v-model="note.content[0]"
            label="Contenu de la note"
            :rules="[value => (value && value.trim().length > 0) || 'Le contenu est obligatoire']"
            clearable
            autogrow
          />
          <div class="wrap-date q-mt-xl">
            <div> Modifiée le
              {{
                new Date(note.updatedAt).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })
              }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="isEditing" class="q-mt-md">
        <q-btn :style="{backgroundColor: color.value}" label="Annuler" flat @click="cancelEdit"></q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import handleDelete from 'src/handleDelete';
import { useQuasar } from 'quasar';
const $q = useQuasar();

const route = useRoute();
const router = useRouter();
const note = ref(null);

let isLoading = ref(true)
let isEditing = ref(false)
let fetchError = ref(false)

const lienAPI = 'https://postit.zoul.dev/notes';
const id = route.params.id;

const getSpecificNote = async() => {
  try {
    const request = await fetch(`${lienAPI}/${id}`);
    if (!request.ok) {
      throw new Error('Erreur lors de la récupération de la note')
    }
    const reponse = await request.json();
    // console.log('note', reponse);
    return reponse;
  } catch (error) {
    let message = 'Une erreur est survenue lors de la récupération de la note.'
    fetchError.value = true;
    console.error(message, error)
  } finally {
    isLoading.value = false
  }
};

const handleDeleteNote = () => {
  handleDelete(note.value, note.value._id, $q, router);
  if (fetchError.value) {
    router.push('/');
  }
};

const updateNote = async() => {
    try {
      const request = await fetch(`${lienAPI}/${id}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: note.value.title,
        content: note.value.content,
      })
    });
    console.log(request);
    isLoading.value = true;
    if(request.ok){
      isEditing.value = false;
      note.value = null;
      const updatedNote = await getSpecificNote();
      isLoading.value = false;
      note.value = updatedNote;

      $q.notify({
        icon: 'check',
        message: 'La note a été modifiée.',
        position: 'top',
        progress: true,
        timeout: 2000,
        type: 'positive',
      })
    } else{
      $q.notify({
        icon: 'warning',
        message: 'Erreur lors de la mise à jour de la note.',
        position: 'top',
        progress: true,
        timeout: 2000,
        type: 'negative',
      })
      throw new Error('Erreur lors de la mise à jour de la note');
    }
    } catch (error) {
      let message = 'Une erreur est survenue lors de la récupération de la note.';
      // console.log(note.value.title,note.value.content[0]);
      console.error(message, error)
    } finally{
      isLoading.value = false;
      fetchError.value = false;
    }
};

const editClick = async () => {
  if(isEditing.value){
    await updateNote();
    isEditing.value = false;
  } else{
    isEditing.value = true;
  }
};

const cancelEdit = async() => {
  if(isEditing.value){
    const calcelledNote = await getSpecificNote();
    isLoading.value = false;
    note.value = calcelledNote;
    isEditing.value = false;
  }
};

let colors = ['#FEF08A', '#BAE6FD', '#A7F3D0', '#FECDD3', '#FED7AA', '#D3BEF0'];
// const color = ref(options[0]);
const options = [

  { label: 'Jaune', value: colors[0] },
  { label: 'Bleu', value: colors[1] },
  { label: 'Vert', value: colors[2] },
  { label: 'Rose', value: colors[3] },
  { label: 'Orange', value: colors[4] },
  { label: 'Violet', value: colors[5] },

];

let color = ref(null);

const savedColor = localStorage.getItem(`color-note-${id}`);
if(savedColor){
  color.value = ref(JSON.parse(savedColor));
  color.value = color.value.value;
} else{
  color = ref(options[0])
  localStorage.setItem(`color-note-${id}`, JSON.stringify(color));
}

watch(color, (newChoice) => {
  localStorage.setItem(`color-note-${id}`, JSON.stringify(newChoice));
})

onMounted(async () => {
  note.value = null;
  const noteData = await getSpecificNote();
  note.value = noteData;
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Playwrite+ZA:wght@100..400&family=Playwrite+DE+Grund:wght@100..400&display=swap');

$color-0: #FEF08A;
$color-1: rgb(186, 230, 253);
$color-2: #A7F3D0;
$color-3: #FECDD3;
$color-4: #FED7AA;
$color-black: #0A0903;
$color-white: #F3F3F3;
$font-title: "Playwrite DE Grund", cursive;
$font-content: "Playwrite ZA", cursive;
$loading-time: 700ms;

.background-0{
  background-color: $color-0;
}

.background-1{
  background-color: $color-1;
}

.background-2{
  background-color: $color-2;
}

.background-3{
  background-color: $color-3;
}

.background-4{
  background-color: $color-4;
}

.text-color-white{
  color: $color-white;
}
.text-color-black{
  color: $color-black;
}

.round-border{
  border-radius: 8px;
}

.myFontTitle {
  font-family: $font-title;
  line-height: 2;
}
.myFontContent {
  font-family: $font-content;
  line-height: 2;
}

.myBtns {
  width: 330px;
  height: fit-content;
  margin-bottom: 30px;
  // position: absolute;
  // bottom: 10px;
  // right: 16px;
}


.loaders {
  border: 8px solid $color-white;
  border-top: 8px solid v-bind('color.value');
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin $loading-time linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
