const PrimaryButton = ({ onClick, text }) => {
    return (
        <button
            onClick={onClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 uppercase font-semibold"
        >
            {text}
        </button>
    );
};

export default PrimaryButton;
