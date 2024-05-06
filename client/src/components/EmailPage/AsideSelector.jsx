import { useQuery} from '@apollo/client';
import { useState } from 'react';
import { QUERY_LEADERS, QUERY_WOG } from '../../utils/queries';
import getGroups from '../../utils/getGroups';
import {Button, Offcanvas, Collapse} from 'react-bootstrap';

export default function AsideSelector({ register, errors }) {
    const { loading: leadersLoading, data: leadersData } = useQuery(QUERY_LEADERS);
    const { loading: membersLoading, data: membersData } = useQuery(QUERY_WOG);
    let members = membersData?.members || [];
    let leaders = leadersData?.getLeaders || [];
    let workoutGroups = getGroups(members);

    const [show, setShow] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    return (
        <>
            <Button type='button' variant={errors["recipient"] ? 'danger' : 'primary'} onClick={handleShow}>Select Recipients</Button>

            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Recipients</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <b>Leaders</b>
                    <ul style={{ listStyle: 'none', paddingLeft: 15}}>
                        {leadersLoading ? (
                            <li>...Loading Recipients</li>
                        ) : (leaders.map((leader) => {
                            return (
                                <li key={Math.random()} style={{ paddingRight: 5 }}>
                                    <input
                                        type="checkbox"
                                        value={leader._id}
                                        {...register("recipient")}
                                        style={{marginRight: 3}}
                                    />
                                    {leader.firstName} {leader.lastName}
                                </li>
                            )
                        }))}
                    </ul>
                    <b key={Math.random()}>Workout Groups</b>
                    {membersLoading ? (
                        <ul key={Math.random()} style={{ listStyle: 'none', paddingLeft: 15 }}>
                            <li key={Math.random()}>...Loading Recipients</li>
                        </ul>
                    ) : (workoutGroups.map((group) => {
                        const swimmers = members.filter((member) => member.workoutGroup === group);
                            return(
                                <>
                                    <ul key={Math.random()} style={{ listStyle: 'none', paddingLeft: 15 }}>
                                        <b key={Math.random()}><u>{group}</u></b>
                                        {swimmers.map(swimmer => {
                                            return(                                                    <li key={Math.random()} style={{ paddingRight: 5 }}>
                                                        <input
                                                            key={Math.random()}
                                                            type="checkbox"
                                                            value={swimmer._id}
                                                            {...register("recipient")}
                                                            style={{ marginRight: 3 }}
                                                        />
                                                        {swimmer.firstName} {swimmer.lastName}
                                                    </li>
                                            )
                                        })}
                                    </ul>
                                </>
                            )
                        })
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}
