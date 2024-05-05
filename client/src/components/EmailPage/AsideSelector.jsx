import { useQuery} from '@apollo/client';
import { useState } from 'react';
import { QUERY_LEADERS } from '../../utils/queries';
import {Button, Offcanvas} from 'react-bootstrap';

export default function AsideSelector({ register, errors }) {
    const { loading, data } = useQuery(QUERY_LEADERS);
    let leaders = data?.getLeaders || [];

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    return (
        <>
            <Button type='button' onClick={handleShow}>Select Recipients</Button>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Recipients</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ul style={{ listStyle: 'none' }}>
                        <b>Leaders</b>
                        {loading ? (
                            <li>...Loading Recipients</li>
                        ) : (leaders.map((leader) => {
                            return (
                                <li key={Math.random()}>
                                    <input
                                        type="checkbox"
                                        value={leader._id}
                                        {...register("recipient")}
                                    />
                                     {leader.firstName} {leader.lastName}
                                </li>
                            )
                        }))}
                    </ul>

                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}