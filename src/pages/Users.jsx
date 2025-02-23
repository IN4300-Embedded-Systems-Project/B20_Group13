import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Title from '../components/Title';
import PrimaryButton from '../components/PrimaryButton';

function Users() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'member',
        membershipDate: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setUsers(usersList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'users'), formData);
            setFormData({
                name: '',
                email: '',
                role: 'member',
                membershipDate: ''
            });
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    return (
        <div>
            <Title title="User Management" />

            {/* Add User Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="p-2 border rounded"
                    >
                        <option value="member">Member</option>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input
                        type="date"
                        value={formData.membershipDate}
                        onChange={(e) =>
                            setFormData({ ...formData, membershipDate: e.target.value })
                        }
                        className="p-2 border rounded"
                    />
                    <PrimaryButton text="Add User" />
                </div>
            </form>

            {/* Users List */}
            <div className="grid grid-cols-1 gap-4">
                {users.map((user) => (
                    <div key={user.id} className="border p-4 rounded">
                        <h3 className="text-xl font-bold">{user.name}</h3>
                        <p>Email: {user.email}</p>
                        <p>Role: {user.role}</p>
                        <p>Membership Date: {user.membershipDate}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Users;
