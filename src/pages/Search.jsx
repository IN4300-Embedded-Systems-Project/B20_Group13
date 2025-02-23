import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Title from '../components/Title';
import PrimaryButton from '../components/PrimaryButton';

function Search() {
    const [searchParams, setSearchParams] = useState({
        searchType: 'title',
        searchTerm: ''
    });
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const booksRef = collection(db, 'books');
            let q;

            switch (searchParams.searchType) {
                case 'title':
                    q = query(booksRef, where('title', '>=', searchParams.searchTerm));
                    break;
                case 'author':
                    q = query(booksRef, where('author', '>=', searchParams.searchTerm));
                    break;
                case 'isbn':
                    q = query(booksRef, where('isbn', '==', searchParams.searchTerm));
                    break;
                default:
                    q = query(booksRef, where('title', '>=', searchParams.searchTerm));
            }

            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    return (
        <div>
            <Title title="Search Books" />

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="grid grid-cols-3 gap-4">
                    <select
                        value={searchParams.searchType}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, searchType: e.target.value })
                        }
                        className="p-2 border rounded"
                    >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="isbn">ISBN</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search term..."
                        value={searchParams.searchTerm}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, searchTerm: e.target.value })
                        }
                        className="p-2 border rounded"
                    />
                    <PrimaryButton text="Search" />
                </div>
            </form>

            {/* Search Results */}
            <div className="grid grid-cols-1 gap-4">
                {searchResults.map((book) => (
                    <div key={book.id} className="border p-4 rounded">
                        <h3 className="text-xl font-bold">{book.title}</h3>
                        <p>ISBN: {book.isbn}</p>
                        <p>Author: {book.author}</p>
                        <p>Publisher: {book.publisher}</p>
                        <p>Publication Date: {book.publicationDate}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Search;
