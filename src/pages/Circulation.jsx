// src/pages/Circulation.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function Circulation() {
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState('checkout'); // 'checkout' or 'return'

    // Latest scanned book info
    const [scannedBook, setScannedBook] = useState(null);
    const [tempBook, setTempBook] = useState(null);

    useEffect(() => {
        fetchLoans();
        fetchBooks();
        fetchUsers();
    }, []);

    useEffect(() => {
        setStatus({ type: '', message: '' });
    }, [mode, selectedUser]);

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

        const tempBooksCollection = collection(db, 'tempBooks');
        const tempBooksSnapshot = await getDocs(tempBooksCollection);
        const tempBooksList = tempBooksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        if (tempBooksList.length > 0) {
            const outBook = tempBooksList[0];
            setTempBook(outBook);
            setScannedBook(booksList.find((b) => b.isbn === outBook.bookId));
        }
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

    // Process RFID scan
    const handleRfidScan = async (e) => {
        e.preventDefault();

        setIsProcessing(true);
        setStatus({ type: 'info', message: 'Processing RFID...' });

        try {
            if (mode === 'checkout') {
                // Check if user is selected for checkout
                if (!selectedUser) {
                    setStatus({
                        type: 'error',
                        message: 'Please select a user before scanning books for checkout.'
                    });
                    setIsProcessing(false);
                    return;
                }

                // Check if book is already checked out
                const loansRef = collection(db, 'loans');
                const loanQuery = query(
                    loansRef,
                    where('bookId', '==', scannedBook.id),
                    where('status', '==', 'checked-out')
                );
                const loanSnapshot = await getDocs(loanQuery);

                if (!loanSnapshot.empty) {
                    setStatus({
                        type: 'error',
                        message: `This book is already checked out to ${
                            users.find((u) => u.id === loanSnapshot.docs[0].data().userId)?.name ||
                            'another user'
                        }.`
                    });
                    setIsProcessing(false);
                    return;
                }

                // Create checkout date and due date (14 days from now by default)
                const checkoutDate = new Date().toISOString().split('T')[0];
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 14);
                const dueDateStr = dueDate.toISOString().split('T')[0];

                // Add loan record
                await addDoc(collection(db, 'loans'), {
                    userId: selectedUser,
                    bookId: scannedBook.id,
                    checkoutDate: checkoutDate,
                    dueDate: dueDateStr,
                    status: 'checked-out',
                    returnDate: null
                });

                // Update book status
                await updateDoc(doc(db, 'books', scannedBook.id), {
                    status: 'checked-out',
                    lastUpdated: new Date().toISOString()
                });
                await deleteDoc(doc(db, 'tempBooks', tempBook.id));
                setScannedBook(null);

                setStatus({
                    type: 'success',
                    message: `Successfully checked out: ${scannedBook.title}`
                });
            } else if (mode === 'return') {
                // Find active loan for this book
                const loansRef = collection(db, 'loans');
                const loanQuery = query(
                    loansRef,
                    where('bookId', '==', scannedBook.id),
                    where('status', '==', 'checked-out')
                );
                const loanSnapshot = await getDocs(loanQuery);

                if (loanSnapshot.empty) {
                    setStatus({
                        type: 'error',
                        message: 'No active loans found for this book.'
                    });
                    setIsProcessing(false);
                    return;
                }

                const loanDoc = loanSnapshot.docs[0];
                const loanData = loanDoc.data();
                const returnDate = new Date().toISOString().split('T')[0];

                // Update loan status
                await updateDoc(doc(db, 'loans', loanDoc.id), {
                    status: 'returned',
                    returnDate: returnDate
                });

                // Update book status
                await updateDoc(doc(db, 'books', scannedBook.id), {
                    status: 'available',
                    lastUpdated: new Date().toISOString()
                });

                await deleteDoc(doc(db, 'tempBooks', tempBook.id));
                setScannedBook(null);

                // Check for late return and calculate fines if needed
                const dueDate = new Date(loanData.dueDate);
                const today = new Date();

                if (today > dueDate) {
                    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    const fineAmount = daysLate * 0.5; // $0.50 per day late

                    // Create a fine record
                    await addDoc(collection(db, 'fines'), {
                        userId: loanData.userId,
                        loanId: loanDoc.id,
                        amount: fineAmount,
                        reason: 'overdue',
                        status: 'pending',
                        dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Due in 30 days
                        createdAt: new Date().toISOString(),
                        paidAt: null
                    });

                    setStatus({
                        type: 'warning',
                        message: `Book returned ${daysLate} days late. Fine of $${fineAmount.toFixed(2)} applied.`
                    });
                } else {
                    setStatus({
                        type: 'success',
                        message: `Successfully returned: ${scannedBook.title}`
                    });
                }
            }

            // Refresh loans list
            fetchLoans();
        } catch (error) {
            console.error('Error processing RFID scan:', error);
            setStatus({
                type: 'error',
                message: `Error: ${error.message}`
            });
        }

        setIsProcessing(false);

        // Auto-focus back on the input field
        if (rfidInputRef.current) {
            rfidInputRef.current.focus();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Circulation Management</h2>

            {/* Mode Toggle */}
            <div className="flex p-1 mb-6 bg-gray-100 rounded-lg w-fit">
                <button
                    className={`px-4 py-2 rounded-md ${
                        mode === 'checkout' ? 'bg-blue-500 text-white' : 'text-gray-700'
                    }`}
                    onClick={() => setMode('checkout')}
                >
                    Check Out
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${
                        mode === 'return' ? 'bg-blue-500 text-white' : 'text-gray-700'
                    }`}
                    onClick={() => setMode('return')}
                >
                    Return
                </button>
            </div>

            {/* User Selection (only for checkout) */}
            {mode === 'checkout' && (
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Select Member
                    </label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* RFID Scanner Input */}
            <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">
                    {mode === 'checkout' ? 'Scan Book to Check Out' : 'Scan Book to Return'}
                </h3>
                <form onSubmit={handleRfidScan} className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Scan RFID tag..."
                        value={scannedBook?.isbn || ''}
                        className="flex-1 p-2 border rounded-md"
                        disabled={isProcessing || (mode === 'checkout' && !selectedUser)}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded-md"
                        disabled={isProcessing || (mode === 'checkout' && !selectedUser)}
                    >
                        {isProcessing ? 'Processing...' : 'Process'}
                    </button>
                </form>
            </div>

            {/* Status Messages */}
            {status.message && (
                <div
                    className={`p-4 rounded-md mb-6 ${
                        status.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : status.type === 'error'
                              ? 'bg-red-100 text-red-800'
                              : status.type === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                    }`}
                >
                    {status.message}
                </div>
            )}

            {/* Recently Scanned Book */}
            {scannedBook && (
                <div className="p-4 mb-6 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold">Recently Scanned Book</h3>
                    <div className="mt-2">
                        <p>
                            <span className="font-medium">Title:</span> {scannedBook.title}
                        </p>
                        <p>
                            <span className="font-medium">Author:</span> {scannedBook.author}
                        </p>
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div>
                <h3 className="mb-2 text-lg font-semibold">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Book
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    User
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loans.slice(0, 10).map((loan) => {
                                const book = books.find((b) => b.id === loan.bookId);
                                const user = users.find((u) => u.id === loan.userId);
                                return (
                                    <tr key={loan.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {book?.title || 'Unknown Book'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user?.name || 'Unknown User'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                            loan.status === 'checked-out'
                                ? 'bg-yellow-100 text-yellow-800'
                                : loan.status === 'returned'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                        }`}
                                            >
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {loan.status === 'checked-out'
                                                ? `Checked out: ${loan.checkoutDate}`
                                                : `Returned: ${loan.returnDate}`}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Circulation;
