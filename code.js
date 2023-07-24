// global variables
const bookDiv = document.querySelector("#books");
const defaultBookCover = "https://unrulyguides.com/wp-content/uploads/2011/12/generic-cover.jpg"
let allBooks = {}

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
        .then(data => fetchCover(data, book))
        } catch(e) {
            console.log(e);
            bookCover.src = defaultBookCover
        }
                
        
        
        bookContainer.append(bookTitle);
        bookContainer.append(bookDesc);
        bookContainer.append(bookCover);
        
        bookDiv.append(bookContainer);
        allBooks[book.id] = bookContainer;
    }
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
    


}

function checkCover(returnedCover, bookData, book) {
    
    if(returnedCover.source_url) {
        allBooks[book.id].children[2].src = returnedCover.source_url
    } else {
        allBooks[book.id].children[2].src = defaultBookCover
    }
}



const state = "New_York"

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



fetchBooksByState(state)

