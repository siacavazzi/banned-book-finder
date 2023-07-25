// global variables
const bookDiv = document.querySelector(".more-books");
const defaultBookCover = "https://unrulyguides.com/wp-content/uploads/2011/12/generic-cover.jpg"
let allBooks = {}

const mainBookImg = document.querySelector('#main-book-image')
const mainBookTitle = document.querySelector('.book-title')
const mainBookAuthor = document.querySelector('.author')
const mainBookDistrict = document.querySelector('.district-banned')

const addToReadingList = document.querySelector('#add-to-list')
const readingList = document.querySelector('#reading-list')

function loadBooks(books, limit=5) {
    books = sortBooks(books);
    // remove previous books from DOM when called
    let child = bookDiv.firstElementChild;
    while(child) {
        bookDiv.removeChild(child);
        child = bookDiv.firstElementChild;
    }
    // create each book and append to DOM

    if(limit > books.length) {
        limit = books.length;
    }

    for(let i=0;i<limit;i++) {
        let book = books[i];

        const bookContainer = document.createElement("div");
        bookContainer.classList.add("book");
        const bookTitle = document.createElement("h2");
        bookTitle.textContent = book.Title;
        const bookCover = document.createElement("img");

        const bookDesc = document.createElement("p");
        bookDesc.textContent = "By "+book.Author;
        
        try {
        fetch("https://openlibrary.org/search.json?q="+book.Title.replace(/[\W_]+/g," ")+"&limit=1&mode=everything")
        .then(response => response.json())
        .then(data => fetchCover(data, book), getCover(book)) // getCover function is breaking
        } catch(e) {
            bookCover.src = defaultBookCover
        }
        
        bookContainer.append(bookTitle);
        bookContainer.append(bookDesc);
        bookContainer.append(bookCover);
        bookContainer.append(bannedCounty)
        
        bookDiv.append(bookContainer);
        allBooks[book.id] = bookContainer;
    }
    // when the loop is done running, populate first book of all books

    // setTimeout(getCover(books[0]), 100)
    mainBookTitle.textContent = books[0].Title
    mainBookAuthor.textContent = books[0].Author
    mainBookDistrict.textContent = books[0].District
}

async function fetchCover(bookData, book) {
    console.log(bookData)
    if(!(bookData.docs[0] === undefined)) {
        try {
        fetch("https://covers.openlibrary.org/b/olid/"+bookData.docs[0].cover_edition_key+".json")
        .then(resp => resp.json())
        .then(data => checkCover(data, bookData, book))
        } catch(e) {
            console.log(e);
            allBooks[book.id].src = defaultBookCover
        }
    } else {
        allBooks[book.id].children[2].src = defaultBookCover
    }
  getCover( allBooks[book.id])
}

function getCover(book0) {
    mainBookImg.src = console.log(book0.children[2])
}

function checkCover(returnedCover, bookData, book) {
    
    if(returnedCover.source_url) {
        allBooks[book.id].children[2].src = returnedCover.source_url
    } else {
        allBooks[book.id].children[2].src = defaultBookCover
    }
}


// sort books by title using Obj compare function
function sortBooks(books) {
    function compare( a, b ) {
        if ( a.Title < b.Title ){
          return -1;
        }
        if ( a.Title > b.Title ){
          return 1;
        }
        return 0;
      }
    return books.sort(compare)
}


// fetch banned books by state then call loadBooks to render them on the page
async function fetchBooksByState(state) {
    fetch("http://localhost:3000/"+state)
    .then(response => response.json())
    .then(data => loadBooks(data))
}

async function fetchBookDetails(book) {
    
}


const state = document.querySelector('#state-names')

document.querySelector('#book-search').addEventListener("submit", (e) => {
    e.preventDefault()
    fetchBooksByState(state.value)
})


// event listener for 'Add to Reading List' button
addToReadingList.addEventListener('click', (e) => {
    e.preventDefault()
    bookTitle = document.querySelector('.book-title')
    const readingTitle = document.createElement('h5')
    readingTitle.textContent = `${bookTitle.textContent} `
    readingList.append(readingTitle)

    checkReadingList()

    const removeButton = document.createElement('button')
    removeButton.textContent = '🗑️'
    readingTitle.append(removeButton)

    removeButton.addEventListener('click', () => {
        e.preventDefault()
        readingTitle.remove()
    })
})

// function that triggers from each state, first to see which books are in the database. see if the book trying to add is already there based on the title, but if not, then post request to post the title to the reading list
function checkReadingList(book) {
    let alreadyInList = false;
    fetch(`http://localhost:3000/ReadingList`)
    .then (r => r.json())
    .then (data => () => {
        for (let readingListBook of data) {
            if(book.title === readingListBook.title) {
                alreadyInList = true
            }
        }
        if(!alreadyInList) { 
        fetch(`http://localhost:3000/ReadingList`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept":"application/json"
            },
            body: JSON.stringify({
                readingListBook,
            })
        })
        .then (r => r.json())
        .then (data => console.log(data))
            // POST book object to ReadingList
        }
        })
    }
    

