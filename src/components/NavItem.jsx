import { Link } from 'react-router-dom';

const NavItem = ({ to, text }) => {
    return (
        <Link to={to} className="hover:text-blue-200 hover:border-b-2 hover:border-b-blue-200 text-xl pb-2 px-2">
            {text}
        </Link>
    );
};

export default NavItem;
