import {useState} from 'react';
import {Link} from 'react-router-dom';

// for when auth is implemented
// import Auth from '/../..utils/auth';

const EmailForm = ({_placeholder}) => {
    const [emailTo, setEmailTo] = useState('');
    const [emailFrom, setEmailFrom] = useState('');
    
}