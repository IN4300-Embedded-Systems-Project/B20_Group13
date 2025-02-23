import { Link } from 'react-router-dom';

// local imports
import { useAuth } from '../contexts/AuthContext';
import NavItem from './NavItem';

function Navbar() {
    const { currentUser } = useAuth();

    return (
        <nav className="bg-blue-800 text-white py-8 border-t border-t-blue-400">
            <div className="w-10/12 mx-auto flex justify-between items-center">
                <Link to="/" className="text-3xl font-bold">
                    Library Management
                </Link>
                <div className="space-x-8">
                    <NavItem to="/books" text="Books" />
                    <NavItem to="/users" text="Users" />
                    <NavItem to="/circulation" text="Circulation" />
                    <NavItem to="/search" text="Search" />
                    {!currentUser ? (
                        <NavItem to="/login" text="Login" />
                    ) : (
                        <span className="hover:text-blue-200">{currentUser.email}</span>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
