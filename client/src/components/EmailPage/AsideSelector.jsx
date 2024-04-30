export default function AsideSelector({setError, handleInputChange, recipients}) {
    return (
        <aside
            onMouseLeave={() => {
                if (recipients.length <= 0) {
                    setError('Please select at least 1 person as a recipient')
                } else {
                    setError('');
                }
            }}
        >
            <p>Select Recipients</p>
            <ul style={{ listStyle: 'none' }}>
                <li><input type="checkbox" name="recipient" value={'p-1'} onChange={handleInputChange} />person 1</li>
                <li><input type="checkbox" name="recipient" value={'p-2'} onChange={handleInputChange} />person 2</li>
                <li><input type="checkbox" name="recipient" value={'p-3'} onChange={handleInputChange} />person 3</li>
                <li><input type="checkbox" name="recipient" value={'p-4'} onChange={handleInputChange} />person 4</li>
                <li><input type="checkbox" name="recipient" value={'p-5'} onChange={handleInputChange} />person 5</li>
                <li><input type="checkbox" name="recipient" value={'p-6'} onChange={handleInputChange} />person 6</li>
            </ul>
        </aside>
    )
}