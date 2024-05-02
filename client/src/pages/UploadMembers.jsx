import { useState } from 'react';
import { useMutation } from '@apollo/client';
import Auth from '../utils/auth';
import { UPLOAD_MEMBERS } from '../utils/mutations';
import papa from 'papaparse';

export default function UploadMembers() {
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState('');
  const [upload, { error }] = useMutation(UPLOAD_MEMBERS);

  // simulate a login (token from Apollo sandbox)
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoiVkFNZW1iZXJzaGlwQHVzbXMub3JnIiwicm9sZSI6Im1lbWJlcnNoaXAiLCJfaWQiOiI2NjMzOGJlZjk3N2EyYzY1MTA5NDAwMzMifSwiaWF0IjoxNzE0Njg0MzUyLCJleHAiOjE3MTQ3MDU5NTJ9.KPww3m4U99gMTgv2n7tCRlcIZ0CktSjSlJFzp6a_lYY';
  Auth.login(token);

  const handleFile = (e) => {
    setFile(e.target.value);
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = async () => {
      const results = await papa.parse(reader.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      setMembers([...results.data]);
    }
    reader.onerror = () => console.log(reader.error);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // extract the parts that we need
    const memberData = members.map(member => {
      const obj = {};
      obj.usmsRegNo = member['USMS Number'];
      obj.firstName = member['First Name'];
      obj.lastName = member['Last Name'];
      obj.gender = member.Gender;
      obj.club = member.Club.toString();
      obj.workoutGroup = member['WO Group'];
      obj.regYear = member['Reg. Year'];
      obj.emails = [];
      if (member['(P) Email Address']) obj.emails.push(member['(P) Email Address']);
      if (member['(S) Email Address']) obj.emails.push(member['(S) Email Address']);
      obj.emailExclude = member['Exclude LMSC Group Email'] === 'Y';
      return obj;
    });

    // update the DB
    await upload({ variables: { memberData } });

    if (error) {
      setMessage(`There was a problem: ${error}`);
    } else {
      setMessage(`Success! ${memberData.length} members added.`)
    }

    //reset state variables
    setMembers([]);
    setFile('');
  };

  return (
    <>
      <h2>Upload Membership Roll</h2>

      <h3>File Input Form</h3>

      <form
        onSubmit={handleFormSubmit}
      >
        <label htmlFor="members">
          Membership file (CSV format):{' '}
        </label>
        <input
          type="file"
          id="members"
          name="members"
          value={file}
          accept=".csv"
          onChange={handleFile}
        />
        <p>
          <button>Upload</button>
        </p>
      </form>

      {message && <p> {message} </p>}

      <h3>Instructions For Upload (roll-ups?)</h3>

    </>
  );
};
