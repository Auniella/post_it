<template>
  <q-page style="padding: 12px 18px; margin: auto; display: grid">
    <div class="flex justify-between">
      <p style="align-self: flex-start" class="text-h4 myFontTitle text-weight-bolder q-my-md">
        Toutes les notes
      </p>
      <p v-if="searchNote.trim().length > 0 && pagination.paginatedItems.value.length < 11" style="align-self: flex-start" class="text-h5 myFontTitle text-weight-bolder q-my-md">
        {{ pagination.paginatedItems.value.length }} {{ formulationSearch}}
      </p>
      <p v-else style="align-self: flex-start" class="text-h5 myFontTitle text-weight-bolder q-my-md">
        {{ notesData.length }} {{ formulationDisplay }}
      </p>
    </div>
    <div class="flex wrap justify-between items-baseline full-width q-mb-md">
      <q-input
        filled
        v-model="searchNote"
        label="Rechercher une note"
        clearable
        class="searchBar myFontTitle">
        <template v-slot:prepend><q-icon name="search" /></template>
      </q-input>
      <div class="flex items-center">
        <!-- <q-icon name="filter_list" size="md" class="q-mr-sm" /> -->
        <q-select filled class="myFontTitle" v-model="sortOrder" :options="sortOptions" style="width: 210px">
          <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="myFontTitle">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          <template v-slot:prepend><q-icon name="filter_list" /></template>
        </q-select>
      </div>
    </div>

    <div class="row justify-start q-col-gutter-md">
      <div style="min-height: 200px" class="round-border col-12 col-sm-6 col-md-4 col-lg-3">
        <q-btn
          style="height: 100%; width: 350px; max-width: 350px;"
          icon="add"
          @click="addNote"
          class="round-border flex justify-center items-center bg-grey-13 text-grey-8 text-h4 shadow-6 cursor-pointer"
          ><q-tooltip class="no-wrap" anchor="bottom middle" self="center middle">
            Ajouter une note</q-tooltip
          ></q-btn
        >
      </div>
      <div
        v-if="isLoading || fetchError"
        style="width: 100%"
        class="flex justify-center items-center"
      >
        <div v-if="isLoading" class="loader flex justify-center items-center"></div>
        <div v-else-if="fetchError" class="text-negative">
          Erreur lors de la récupération des notes.
        </div>
      </div>

      <template v-else>
        <div v-if="pagination.paginatedItems.value.length <= 0">Aucune note n'a été ajoutée</div>
        <div
          v-for="note in pagination.paginatedItems.value"
          :key="note._id"
          class="myCard round-border col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <div
            style="height: 100%; max-width: 365px;"
            :style="{ backgroundColor: color[note._id].value }"
            class="round-border shadow-6 relative-position cursor-pointer"
            @click="router.push(`/note/${note._id}`)"
          >
            <div class="q-pa-md">
              <div class="myFontTitle casser text-weight-bolder ellipsis">{{ note.title }}</div>
              <q-separator class="q-my-md" color="black"></q-separator>
              <div class="myFontTitle casser ellipsis-2-lines">{{ note.content[0] }}</div>
              <!-- <div class="casser ellipsis-3-lines" v-html="note.content[0]"></div> -->
            </div>
            <div class="wrapper">
              <div>
                {{
                  new Date(note.createdAt).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })
                }}
              </div>
              <div style="width: 125px" class="btns flex justify-between">
                <q-btn class="bg-black text-color-white" icon="visibility" :to="`/note/${note._id}`"
                  ><q-tooltip anchor="bottom start" self="center start">
                    Voir plus</q-tooltip
                  ></q-btn
                >
                <q-btn
                  class="bg-black text-color-white"
                  icon="delete"
                  @click.stop="handleDelete(notesData, note._id, $q)"
                  ><q-tooltip anchor="bottom start" self="center start">
                    Supprimer la note</q-tooltip
                  ></q-btn
                >
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <q-pagination
      v-model="pagination.page.value"
      class="q-mt-xl q-mb-sm myFontTitle text-weight-bold"
      active-color="light-blue-3"
      active-text-color="black"
      :max="pagination.totalPages.value"
      :max-pages="2"
      boundary-numbers
      direction-links
    />
  </q-page>
</template>
<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue'
import AddNoteForm from 'src/components/AddNoteForm.vue'
import handlePagination from 'src/handlePagination'
import handleDelete from 'src/handleDelete'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
const $q = useQuasar()
const router = useRouter();

const lienAPI = 'https://postit.zoul.dev/notes'

const notesData = ref([])

let isLoading = ref(true)
let fetchError = ref(false)

const searchNote = ref('')

const sortOrder = ref({ label: 'Plus récentes', value: 'recent' })
const sortOptions = [
  { label: 'Plus récentes', value: 'recent' },
  { label: 'Plus anciennes', value: 'old' },
]

// const pagination = handlePagination(notesData)

const getNotes = async () => {
  try {
    const request = await fetch(lienAPI)
    if (!request.ok) {
      $q.notify({
        icon: 'warning',
        message: 'Erreur lors de la récupération des notes.',
        position: 'top',
        progress: true,
        timeout: 2000,
        type: 'negative',
      })
      throw new Error('Erreur lors de la récupération des notes')
    }
    const reponse = await request.json()
    return reponse
  } catch (error) {
    let message = 'Une erreur est survenue lors de la récupération des notes.'
    fetchError.value = true
    console.error(message, error)
  } finally {
    isLoading.value = false
  }
}

const addNote = () => {
  $q.dialog({
    component: AddNoteForm,
  }).onOk(async (newNoteData) => {
    // console.log(newNoteData);
    if(newNoteData.content.trim().length <= 0){
      $q.notify({
        icon: 'report_problem',
        message: "Le contenu ne peut être vide.",
        position: 'top',
        progress: true,
        timeout: 2000,
        type: 'negative',
      })
      addNote();
      return;
    }
    if(newNoteData.title.trim().length <= 0){
      $q.notify({
        icon: 'warning',
        message: "Le titre ne peut être vide.",
        position: 'top',
        progress: true,
        timeout: 2000,
        type: 'negative',
      })
      addNote();
      return;
    }
    try {
      const request = await fetch(lienAPI, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: newNoteData.title,
          content: [newNoteData.content],
        }),
      })
      if (request.ok) {
        const data = await getNotes()
        notesData.value = data.notes
        updateColors()

        $q.notify({
          icon: 'check',
          message: 'La note a été ajoutée.',
          position: 'top',
          progress: true,
          timeout: 2000,
          type: 'positive',
        })
      } else {
        $q.notify({
          icon: 'warning',
          message: "Erreur lors de l'ajout de la note.",
          position: 'top',
          progress: true,
          timeout: 2000,
          type: 'negative',
        })
        throw new Error("Erreur lors de l'ajout de la note.")
      }
    } catch (error) {
      let message = 'Une erreur est survenue lors de la récupération de la note.'
      console.error(message, error)
    }
  })
}

const handleSearch = computed(() => {
  // console.log(sortOrder.value.value);
  let sortedNotes = [...notesData.value]
  if (sortOrder.value.value === 'old') {
    sortedNotes = sortedNotes.reverse()
  }
  if (searchNote.value && searchNote.value.trim().length <= 0) {
    return pagination.paginatedItems.value
  }
  const searchQuery = searchNote.value.toLowerCase()
  return sortedNotes.filter((note) => {
    let titleFound = false
    let contentFound = false
    // console.log('titre', note.title);
    // console.log('content', note.content[0]);
    if (note.title) {
      titleFound = note.title.toLowerCase().includes(searchQuery)
    }

    if (note.content) {
      contentFound = note.content[0].toLowerCase().includes(searchQuery)
    }
    return titleFound || contentFound
  })
})

const pagination = handlePagination(handleSearch)

const formulationSearch = computed(() => {
  return pagination.paginatedItems.value.length <= 1 ? 'note' : 'notes'
})
const formulationDisplay = computed(() => {
  return notesData.value.length  <= 1 ? 'note' : 'notes'
})

let colors = [
  { label: 'Jaune', value: '#FEF08A' },
  { label: 'Bleu', value: '#BAE6FD' },
  { label: 'Vert', value: '#A7F3D0' },
  { label: 'Rose', value: '#FECDD3' },
  { label: 'Orange', value: '#FED7AA' },
  { label: 'Violet', value: '#D3BEF0' },
]
let color = ref({})

const updateColors = () => {
  notesData.value.forEach((note) => {
    if (color.value[note._id]) {
      return
    }
    const savedColors = localStorage.getItem(`color-note-${note._id}`)
    if (savedColors) {
      color.value[note._id] = JSON.parse(savedColors)
      return
    } else {
      let randomIndex = Math.floor(Math.random() * colors.length)
      let label = colors[randomIndex].label
      let value = colors[randomIndex].value
      localStorage.setItem(`color-note-${note._id}`, JSON.stringify({ label, value }))
      color.value[note._id] = { label, value }
    }
  })
}

onMounted(() => {
  let interval = null
  const refreshNotes = async () => {
    try {
      const data = await getNotes()
      // console.log(data)
      if (data) {
        notesData.value = data.notes
        // console.log(notesData.value.length);
        updateColors()
      }
    } catch (error) {
      let message = 'Une erreur est survenue lors de la récupération des notes.'
      fetchError.value = true
      console.error(message, error)
    } finally {
      isLoading.value = false
    }
  }
  refreshNotes()
  interval = setInterval(refreshNotes, 2000)

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Playwrite+ZA:wght@100..400&family=Playwrite+DE+Grund:wght@100..400&display=swap');

$color-0: #fef08a;
$color-1: #bae6fd;
$color-2: #a7f3d0;
$color-3: #fecdd3;
$color-4: #fed7aa;
$color-black: #0a0903;
$color-white: #f3f3f3;
$font-title: "Playwrite DE Grund", cursive;
$font-content: "Playwrite ZA", cursive;
$loading-time: 700ms;

.background-0 {
  background-color: $color-0;
}

.background-1 {
  background-color: $color-1;
}

.background-2 {
  background-color: $color-2;
}

.background-3 {
  background-color: $color-3;
}

.background-4 {
  background-color: $color-4;
}

.text-color-white {
  color: $color-white;
}
.text-color-black {
  color: $color-black;
}

.round-border {
  border-radius: 8px;
}

.myFontTitle {
  font-family: $font-title;
  line-height: 1.8;
}
.myFontContent {
  font-family: $font-content;
  line-height: 2;
}

.wrapper {
  margin: 0 16px 0 16px;
  width: calc(100% - 32px);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
}

.btns {
  width: 125px;
  // position: absolute;
  // bottom: 10px;
  // right: 16px;
}

.loader {
  border: 8px solid $color-white;
  border-top: 8px solid $color-1;
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

.myCard {
  min-height: 200px;
  box-sizing: border-box;
  transition: transform 200ms;
}

.myCard:hover {
  transform: scale(1.05);
}

.casser {
  word-break: break-all;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  overflow: hidden;
}

@media (max-width: 600px) {
  .myCard {
    max-width: 100vw;
    padding: 16px;
    min-height: 220px;
  }

  .searchBar {
    width: 350px;
    margin-bottom: 20px;
  }
}
@media (min-width: 600px) {
  .searchBar {
    width: 600px;
  }
}
</style>
