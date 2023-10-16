
const listEl = document.querySelector('#list')
const inputEl = document.querySelector('#filter')
const paginationEl = document.querySelector('#container-pagination')
const counterEl = document.querySelector('#counter')
const prevEl = document.querySelector('#prev')
const nextEl = document.querySelector('#next')
const btnBoxEl = document.querySelector('#pagination-box-btn')
const btnTotal = btnBoxEl.querySelector('#total')
const btnClearInpEl = document.querySelector('#clear')

let COMMENTS = []
let totalCountComments = null
let numberCommentsPerPage = 10
let pageNumber = 1
let numberOfPages = null

// Фильтрация по email
function filterChar() {
    const valueChar = this.value
    if (!valueChar) {
        btnClearInpEl.classList.add('d-none')
    } else {
        btnClearInpEl.classList.remove('d-none')
    }

    const filteredComments = COMMENTS.filter(comment => {
        return comment.email.toLowerCase().includes(this.value.toLowerCase())
    })
    render(filteredComments, valueChar)
}

// Вешаем слушатели на Input и на блок pagination
inputEl.addEventListener('input', filterChar)
paginationEl.addEventListener('click', changePrevNext)
btnBoxEl.addEventListener('click', setNumberComments)
btnClearInpEl.addEventListener('click', clearInput)

// Очищаем Input
function clearInput() {
    inputEl.value = ''
    btnClearInpEl.classList.add('d-none')
    render(COMMENTS)
}

// Пользователь выбирает количество показываемых комментариев
function setNumberComments(e) {
    e.preventDefault()
    let activeBtn = btnBoxEl.querySelector('.active')
    if (e.target.tagName === 'BUTTON') {
        if (e.target.classList.contains('active')) {
            return
        } else {
            numberCommentsPerPage = Number(e.target.innerHTML)
            pageNumber = 1
            e.target.classList.add('active')
            activeBtn.classList.remove('active')
        }
        start()
    }

}

// Устанавливаем значения кнопок prev next
function setCountPage(prevNum, nexNum) {
    return counterEl.innerHTML = `${prevNum} / ${nexNum}`
}

// Изменяем значения кнопок prev next
function changePrevNext(e) {
    e.preventDefault()
    if (e.target.id === 'prev' && pageNumber > 1) {
        pageNumber--
        setCountPage(pageNumber, numberOfPages)
        inputEl.value = ''
        start()
    }
    if (e.target.id == 'next' && pageNumber < numberOfPages) {
        pageNumber++
        setCountPage(pageNumber, numberOfPages)
        inputEl.value = ''
        start()
    }
}

// Получение комментов API
async function start() {
    listEl.innerHTML = 'Загружаем комментарии . . .'
    paginationEl.classList.add('d-none')
    try {
        const resp = await fetch(
            `https://jsonplaceholder.typicode.com/comments?_page=${pageNumber}&_limit=${numberCommentsPerPage}`
        )
        totalCountComments = resp.headers.get('X-Total-Count')
        btnTotal.innerHTML = totalCountComments
        numberOfPages = Math.ceil(totalCountComments / numberCommentsPerPage)
        setCountPage(pageNumber, numberOfPages)
        let data = await resp.json()

        // имитируем задержку сервера
        setTimeout(() => {
            COMMENTS = data
            render(COMMENTS)
        }, 100)

    } catch (error) {
        listEl.style.color = 'red'
        listEl.innerHTML = error.message
    }

    // условия для disabled button prev, next
    if (pageNumber >= 2) {
        prevEl.removeAttribute('disabled')
    } else {
        prevEl.setAttribute('disabled', true)
    }
    if (pageNumber >= numberOfPages) {
        nextEl.setAttribute('disabled', true)
    } else {
        nextEl.removeAttribute('disabled')
    }

}
start()

// Рендер комментов
function render(comments = [], valueChar = null) {
    if (!comments.length) {
        listEl.innerHTML = 'Пользователя с таким e-mail нет'
        paginationEl.classList.add('d-none')

    } else {
        paginationEl.classList.remove('d-none')
        const html = comments.map(comment => {
            const regex = new RegExp(`${valueChar}`, 'gi')
            const findEmail = comment.email.replace(regex,
                (match) => `<span class="bg-warning">${match}</span>`
            )
            return `
                <li class="list-group-item pt-3">
                <span class="font-monospace">${findEmail}</span>
                <p class="font-monospace">id: ${comment.id}</p>
                    <p class="mt-2">${comment.body}</p>
                </li>
                    `
        }).join('')

        listEl.innerHTML = html
    }
}

