import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import Title from '../components/Title';

function Dashboard() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        activeLoans: 0,
        overdueLoans: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Get total books
            const booksSnapshot = await getDocs(collection(db, 'books'));
            const totalBooks = booksSnapshot.size;

            // Get total users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Get loans
            const loansSnapshot = await getDocs(collection(db, 'loans'));
            const loans = loansSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            const activeLoans = loans.filter((loan) => loan.status === 'checked-out').length;
            const overdueLoans = loans.filter((loan) => {
                return loan.status === 'checked-out' && new Date(loan.dueDate) < new Date();
            }).length;

            setStats({
                totalBooks,
                totalUsers,
                activeLoans,
                overdueLoans
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div>
            <Title title="Dashboard" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card title="Total Books" count={stats.totalBooks} />
                <Card title="Total Users" count={stats.totalUsers} />
                <Card title="Active Loans" count={stats.activeLoans} />
                <Card title="Overdue Loans" count={stats.overdueLoans} />
            </div>
        </div>
    );
}

export default Dashboard;
