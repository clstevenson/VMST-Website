import { useState } from 'react';
import { useMutation } from '@apollo/client';
import Auth from '../utils/auth';
import { UPLOAD_MEMBERS } from '../utils/mutations';
import papa from 'papaparse';
import ErrorPage from './ErrorPage';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Figure from 'react-bootstrap/Figure'

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
  const getMemberInfo = () => { };

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
    if (file === '') return;
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
                The steps are shown in the following figure.
              </p>
              <Figure>
                <Figure.Image
                  src="./assets/MemberReportGeneration1.png"
                  alt="generate HTML report screenshot"
                />
                <Figure.Caption>
                  Generate an HTML report of all current members containing all fields.
                </Figure.Caption>
              </Figure>

              <ol>
                <li>
                  After logging into the Registration section of the USMS Site/Database Administration, click the "Member Report" item on the "Report" drop-down menu.
                </li>
                <li>
                  Click on "Select all" to display all available fields in the report.
                </li>
                <li>
                  Choose the years to generate all current members. That will always involve checking the current year; in the months of Nov and Dec you will also need to check the next calendar year.
                </li>
                <li>
                  Choose the "HTML" report type.
                </li>
                <li>
                  Click on the button to generate the report.
                </li>
              </ol>

              <p>
                After the report appears you will get a display like the one shown in the figure below. Check to make sure that all members seem to be included in the report and that all fields were generated (you will have to scroll horizontally to verify). Then click on the CSV button to download the report as a text file with Comma Separated Values. This is the file you will import.
              </p>

              <Figure>
                <Figure.Image
                  src="./assets/MemberReportGeneration2.png"
                  alt="download member report as a file"
                />
                <Figure.Caption>
                  Download the generated report in the CSV file format suitable for import.
                </Figure.Caption>
              </Figure>

            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Container>

    </>
  );
};
