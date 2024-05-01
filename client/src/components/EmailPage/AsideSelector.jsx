export default function AsideSelector({ register, errors }) {
    return (
        <aside>
            <p>Select Recipients</p>
            <ul style={{ listStyle: 'none' }}>
                <li><input type="checkbox" value={'p-1'} {...register('recipient')} />person 1</li>
                <li><input type="checkbox" value={'p-2'} {...register('recipient')} />person 2</li>
                <li><input type="checkbox" value={'p-3'} {...register('recipient')} />person 3</li>
                <li><input type="checkbox" value={'p-4'} {...register('recipient')} />person 4</li>
                <li><input type="checkbox" value={'p-5'} {...register('recipient')} />person 5</li>
                <li><input type="checkbox" value={'p-6'} {...register('recipient')} />person 6</li>
            </ul>
        </aside>
    )
}