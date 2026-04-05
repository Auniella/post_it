export default function handleDelete(datas, id, $q, router = null) {
  console.log(id)

const lienAPI = 'https://postit.zoul.dev/notes'

  $q.dialog({
    icon: 'warning',
    title: 'Supprimer la note',
    message: 'Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.',
    cancel: { label: 'Annuler', color: 'primary', flat: true },
    ok: { label: 'Supprimer', color: 'negative', flat: true },
    persistent: true,
  }).onOk(async () => {
    try {
      const request = await fetch(`${lienAPI}/${id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
      })
      if (request.ok) {
        console.log('succès suppression de la note')
        localStorage.removeItem(`color-note-${id}`)
        if (Array.isArray(datas)) {
          console.log('isArray!')
          datas = datas.filter((data) => data._id !== id)
        }

        $q.notify({
          icon: 'check',
          message: 'La note a été supprimée.',
          position: 'top',
          progress: true,
          timeout: 2000,
          type: 'positive',
        })

        if (router) {
          router.push('/')
        }
      }
    } catch (error) {
      let message = 'Une erreur est survenue lors de la récupération de la note.'
      console.error(message, error)
    }
  })
}
