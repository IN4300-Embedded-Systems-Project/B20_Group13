import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Title from '../components/Title';
import PrimaryButton from '../components/PrimaryButton';

function Books() {
    const [books, setBooks] = useState([]);
    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publicationDate: ''
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const booksCollection = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setBooks(booksList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'books'), formData);
            setFormData({
                isbn: '',
                title: '',
                author: '',
                publisher: '',
                publicationDate: ''
            });
            fetchBooks();
        } catch (error) {
            console.error('Error adding book:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'books', id));
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    return (
        <div>
            <Title title="Book Management" />

            {/* Add Book Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="ISBN"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Publisher"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="date"
                        value={formData.publicationDate}
                        onChange={(e) =>
                            setFormData({ ...formData, publicationDate: e.target.value })
                        }
                        className="p-2 border rounded"
                    />
                    <PrimaryButton text="Add Book" />
                </div>
            </form>

            {/* Books List */}
            <div className="grid grid-cols-4 gap-4">
                {books.map((book) => (
                    <div key={book.id} className="p-4 border rounded">
                        <h3 className="text-xl font-bold">{book.title}</h3>
                        <p>ISBN: {book.isbn}</p>
                        <p>Author: {book.author}</p>
                        <p>Publisher: {book.publisher}</p>
                        <p>Publication Date: {book.publicationDate}</p>
                        <button
                            onClick={() => handleDelete(book.id)}
                            className="px-4 py-2 mt-2 text-white bg-red-500 rounded"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Books;
