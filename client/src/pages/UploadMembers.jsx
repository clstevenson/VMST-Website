import { useState } from 'react';
import { useMutation } from '@apollo/client';
import Auth from '../utils/auth';
import { UPLOAD_MEMBERS } from '../utils/mutations';
import papa from 'papaparse';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import ErrorPage from './ErrorPage';

export default function UploadMembers() {
  // state representing new members data uploaded from user
  const [members, setMembers] = useState([]);
  // feedback to the user
  const [message, setMessage] = useState('');
  // state representing currently selected file
  const [file, setFile] = useState('');
  // state that represents what is currently in the DB
  const [current, setCurrent] = useState([]);
  // summary stats of memberhip currently in DB
  const [stats, setStats] = useState({});
  // mutation to update the Members collection in the CB
  // (used in form onSubmit event handler)
  const [upload, { error }] = useMutation(UPLOAD_MEMBERS);

  // query the DB membership
  const getMemberInfo = () => {};

  // file input onchange event handler, which parses the CSV file
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

  // form submit event handler extracts the good parts of the data
  // and uploads to the Members collection of the DB, replacing those contents
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if no file has been chosen then don't do anything
    if (file==='') return;
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
    const { data } = await upload({ variables: { memberData } });
    console.log(data.uploadMembers.length);

    if (data.uploadMembers.length === 0) {
      setMessage(`There was a problem: ${error}`);
    } else {
      // update some state vars: members, member stats
      // these will trigger update of the member table (should that be a spearate component?)


      setMessage(`Success! ${data.uploadMembers.length} members uploaded.`)
    }

    //reset state variables
    setMembers([]);
    setFile('');
  };

  // find out role
  let role;
  Auth.loggedIn()
        ? role = Auth.getProfile().data.role
        : role = '';

  if (role !== 'membership') {
    throw new Error('Not authorized to view this page');
    return <ErrorPage />;
  }

  return (
    <>
      <Container>
        <h1>Upload Membership Roll</h1>

        <Form
          onSubmit={handleFormSubmit}
        >
          <Form.Group>
            <Form.Label htmlFor="members">
              Membership file (CSV format)
            </Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="file"
                  id="members"
                  name="members"
                  value={file}
                  accept=".csv"
                  onChange={handleFile}
                />
                <Form.Text id="CSV help block">
                  CSV export of HTML version of member report (instructions below).
                </Form.Text>
              </Col>
              <Col>
                <Button
                  variant="primary"
                  type="submit"
                >
                  Upload Members
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>

        {/* when message is not an empty string, it is displayed */}
        {message && <Alert variant='success'> {message} </Alert>}

        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              Instructions on generating membership CSV file
            </Accordion.Header>
            <Accordion.Body>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>

              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              </p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>

    </>
  );
};
