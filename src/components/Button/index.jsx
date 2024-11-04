
function Button({onClick}) {
    return (
        <button className="bg-red-500 rounded-md m-10" onMouseDown={onClick}>
            Im a button
        </button>
    )
}

export default Button;