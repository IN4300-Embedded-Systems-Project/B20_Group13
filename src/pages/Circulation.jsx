import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Title from '../components/Title';
import PrimaryButton from '../components/PrimaryButton';

function Circulation() {
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        userId: '',
        bookId: '',
        checkoutDate: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchLoans();
        fetchBooks();
        fetchUsers();
    }, []);

    const fetchLoans = async () => {
        const loansCollection = collection(db, 'loans');
        const loansSnapshot = await getDocs(loansCollection);
        const loansList = loansSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setLoans(loansList);
    };

    const fetchBooks = async () => {
        const booksCollection = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setBooks(booksList);
    };

    const fetchUsers = async () => {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setUsers(usersList);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'loans'), {
                ...formData,
                status: 'checked-out',
                returnDate: null
            });
            setFormData({
                userId: '',
                bookId: '',
                checkoutDate: '',
                dueDate: ''
            });
            fetchLoans();
        } catch (error) {
            console.error('Error checking out book:', error);
        }
    };

    const handleReturn = async (loanId) => {
        try {
            await updateDoc(doc(db, 'loans', loanId), {
                status: 'returned',
                returnDate: new Date().toISOString()
            });
            fetchLoans();
        } catch (error) {
            console.error('Error returning book:', error);
        }
    };

    return (
        <div>
            <Title title="Circulation Management" />

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <select
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="p-2 border rounded"
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={formData.bookId}
                        onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                        className="p-2 border rounded"
                    >
                        <option value="">Select Book</option>
                        {books.map((book) => (
                            <option key={book.id} value={book.id}>
                                {book.title}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={formData.checkoutDate}
                        onChange={(e) => setFormData({ ...formData, checkoutDate: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <PrimaryButton text="Checkout Book" />
                </div>
            </form>

            {/* Loans List */}
            <div className="grid grid-cols-1 gap-4">
                {loans.map((loan) => (
                    <div key={loan.id} className="border p-4 rounded">
                        <h3 className="text-xl font-bold">Loan ID: {loan.id}</h3>
                        <p>User: {users.find((u) => u.id === loan.userId)?.name}</p>
                        <p>Book: {books.find((b) => b.id === loan.bookId)?.title}</p>
                        <p>Status: {loan.status}</p>
                        <p>Checkout Date: {loan.checkoutDate}</p>
                        <p>Due Date: {loan.dueDate}</p>
                        {loan.status === 'checked-out' && (
                            <button
                                onClick={() => handleReturn(loan.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                            >
                                Return Book
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Circulation;
