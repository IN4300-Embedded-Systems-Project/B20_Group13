const Card = ({ title, count }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-3xl font-bold text-red-600">{count}</p>
        </div>
    );
};

export default Card;
