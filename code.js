// global variables
const bookDiv = document.querySelector(".more-books");
const defaultBookCover = "https://unrulyguides.com/wp-content/uploads/2011/12/generic-cover.jpg"
const defaultBookCoverList = []
let allBooks = {}
let bookList = []
let currentState = ''
let currBooks = 0
let currentBook = null;
const loadMore = document.querySelector("#load-more")
const stateDetails = document.querySelector("#state-details")
const mainBookImg = document.querySelector('#main-book-image')
const mainBookTitle = document.querySelector('.book-title')
const mainBookAuthor = document.querySelector('.author')
const mainBookDistrict = document.querySelector('.district-banned')
const addToReadingList = document.querySelector('#add-to-list')
const readingList = document.querySelector('#reading-list')
const currentBookDisplay = document.querySelector("#currentBookNumber")
const goBackBtn = document.querySelector("#go-back")


function loadBooks(books,limit=6) {
    console.log("loop start" + currBooks)
    bookList = books;
    books = sortBooks(books);

    stateDetails.textContent = currentState.replace("_"," ") + " Has " + books.length + " Banned Books"
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
    let max = limit + currBooks;
    if(max > books.length) {
        max = books.length
    }
    for(let i=currBooks;i<max;i++) {
        let book = books[i];
        console.log(i)
        const bookContainer = document.createElement("div");
        bookContainer.classList.add("book");
        const bookTitle = document.createElement("h2");
        bookTitle.textContent = book.Title;
        const bookCover = document.createElement("img");
        const bannedCounty = document.createElement("p");
        bannedCounty.textContent = "Banned in "+book.District;
        const dateBanned = document.createElement("p");

        const bookDesc = document.createElement("p");
        bookDesc.textContent = "By "+book.Author;
        
        try {
        fetch("https://openlibrary.org/search.json?q="+book.Title.replace(/[\W_]+/g," ")+"&limit=1&mode=everything")
        .then(response => response.json())
        .then(data => fetchCover(data, book))

        } catch(e) {
            bookCover.src = defaultBookCover;
        }

        bookContainer.append(bookTitle, bookDesc, bookCover, bannedCounty);
        
        bookDiv.append(bookContainer);
        bookContainer.book = book;
        allBooks[book.id] = bookContainer;
        bookContainer.addEventListener("click",function() {setMainBook(book)});
        
    }
   
    currBooks = currBooks + limit;
    currentBookDisplay.textContent = "Showing "+currBooks+" of "+bookList.length+" books"
    
}

function setMainBook(book) {
    
    currentBook = book
    mainBookTitle.textContent = allBooks[book.id].book.Title
    mainBookAuthor.textContent = allBooks[book.id].book.Author
    mainBookDistrict.textContent = allBooks[book.id].book.District
    mainBookImg.src = allBooks[book.id].children[2].src
}

async function fetchCover(bookData, book) {
    console.log(bookData)
    try {
        if(bookData.docs[0].cover_edition_key !== undefined){
            fetch("https://covers.openlibrary.org/b/olid/"+bookData.docs[0].cover_edition_key+".json")
            .then(resp => resp.json())
            .then(data => checkCover(data, bookData, book))
        } else {
        allBooks[book.id].children[2].src = defaultBookCover
        }
    } catch(e) {
            console.log(e);
            allBooks[book.id].children[2].src = defaultBookCover
        }
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
    e.preventDefault();
    bookList = []
    currBooks = 0;


    currentState = state.value;
    fetchBooksByState(state.value);
    loadMore.style.display = 'block';
    setTimeout(setFirstBook,800)

    currentBookDisplay.textContent = "Showing "+currBooks+" of "+bookList.length+" books"
    
    
})

async function setFirstBook() {
    const firstBook = allBooks[Object.keys(allBooks)[0]].book
    console.log(firstBook)
    setMainBook(firstBook)
}
// event listener for 'Add to Reading List' button
addToReadingList.addEventListener('click', (e) => {

    e.preventDefault()
    checkReadingList()
    
})

// before adding a book to the reading list check to see if its already there
function checkForPost(data) {
    let alreadyInList = false;
    console.log(data)
    for (let readingListBook of data) {
        console.log(currentBook.Title)
        console.log(readingListBook.Title)
        // vvv localeCompare throwing error
        if(data.length > 0 && (currentBook.Title === readingListBook.Title)) {
            alreadyInList = true
            console.log("in list")
        }
    }
    if(!alreadyInList) { 
    console.log(currentBook.Title)
    fetch(`http://localhost:3000/ReadingList`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept":"application/json"
        },
        body: JSON.stringify({
            Title:currentBook.Title,
            Author:currentBook.Author
        })
    })
    renderReadingList()
    }
}

// fetch reading list from server and display on page
function renderReadingList() {
    let child = readingList.firstElementChild;
    while(child) {
        readingList.removeChild(child);
        child = readingList.firstElementChild;
    }
    fetch(`http://localhost:3000/ReadingList`)
    .then(r=> r.json())
    .then(data => {
        for(book of data) {
            bookTitle = document.querySelector('.book-title')
        const readingTitle = document.createElement('li')
        readingTitle.textContent = book.Title
        readingList.append(readingTitle)

        const removeButton = document.createElement('button')
        removeButton.textContent = '🗑️'
        readingTitle.id = book.id
        readingTitle.append(removeButton)

        removeButton.addEventListener('click', (e) => {
        e.preventDefault()
        console.log(e.target.parentElement.id)
        OPTIONS = {
            method: 'DELETE'
        }
        fetch(`http://localhost:3000/ReadingList/`+e.target.parentElement.id,OPTIONS)
        .then(readingTitle.remove())

        
    })
        }
    })
}

// function that triggers from each state, first to see which books are in the database. see if the book trying to add is already there based on the title, but if not, then post request to post the title to the reading list
function checkReadingList() {
    console.log("call");
    
    fetch(`http://localhost:3000/ReadingList`)
    .then (r => r.json())
    .then (data => checkForPost(data));
}

function loadMoreBooks() {
    if(!(currBooks == bookList.length) )
    loadBooks(bookList)
}

function goBack() {
    if(currBooks > 6) {
    currBooks -= 12
    loadBooks(bookList)
    }
}
loadMore.addEventListener("click", function() {loadMoreBooks()})
goBackBtn.addEventListener("click", function() {goBack()})

renderReadingList();


