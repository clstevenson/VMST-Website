import { useState } from 'react';
import Auth from '../utils/auth';

export default function UploadMembers () {
  const [file, setFile] = useState('');

  return (
    <>
      <h2>Upload Membership Roll</h2>

      <h3>File Input Form</h3>

      <form
        onSubmit={e => {
          e.preventDefault();
          console.log(file);
        }}
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
          onChange={e => setFile(e.target.value)}
        />
        <p>
          <button>Upload</button>
        </p>
      </form>

      <h3>Instructions For Upload (roll-ups?)</h3>

    </>
  );
};
