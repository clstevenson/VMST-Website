import { useQuery} from '@apollo/client';
import { QUERY_LEADERS } from '../../utils/queries';

export default function AsideSelector({ register, errors }) {
    const { loading, data } = useQuery(QUERY_LEADERS);
    let leaders = data?.getLeaders || [];

    return (
        <aside>
            <p>Select Recipients</p>
            <ul style={{ listStyle: 'none' }}>
                {loading ? (
                    <li>...Loading Recipients</li>
                ) : (leaders.map((leader) => {
                    return <li key={Math.random()}><input type="checkbox" value={leader._id} {...register("recipient")} /> {leader.firstName} {leader.lastName}</li>
                }))}
            </ul>
        </aside>
    )
}