import { ref, computed } from 'vue';

export default function handlePagination(items, itemsPerPage = 11) {
    let page = ref(1);

    const totalPages = computed(() => Math.ceil(items.value.length / itemsPerPage));

    const paginatedItems = computed(() => {
        const start = (page.value - 1) * itemsPerPage
        return items.value.slice(start, start + itemsPerPage);
    })

    function nextPage() {
        if (page.value < totalPages.value) {
            page.value++;
        }
    }

    function prevPage() {
        if (page.value > 1) {
            page.value--;
        }
    }

    const goToPage = (numPage) => {
      page.value = numPage
    }

    return {
        page,
        totalPages,
        paginatedItems,
        nextPage,
        prevPage,
        goToPage
    }

}
