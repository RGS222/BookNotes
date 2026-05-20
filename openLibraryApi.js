import axios from "axios";

const BOOK_API_URL = "https://openlibrary.org/search.json?lang=en";
const COVER_API_URL = "https://covers.openlibrary.org/b/olid/$olid-L.jpg";

export async function getBookCoverUrl(title, author) {
    let bookUrl = BOOK_API_URL;
    if (title) {
        title = title.replace(" ", "+");
        bookUrl += "&title=" + title;
    }

    if (author) {
        author = author.replace(" ", "+");
        bookUrl += "&author=" + author;
    }

    try {
        // console.log(bookUrl);
        const response = await axios.get(bookUrl);
        const books = response.data.docs;
        if (books) {
            const olid = books[0].cover_edition_key;
            const coverUrl = COVER_API_URL.replace("$olid", olid);
            // console.log(coverUrl);
            return coverUrl;
        }
    }
    catch(error) {
        console.error("Error in getBookCoverUrl", error);
    }

    return null;
}

