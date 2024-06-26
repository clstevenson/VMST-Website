import { useState, useEffect } from 'react';
import Auth from '../utils/auth';
import { useQuery, useMutation } from '@apollo/client';
import { UPLOAD_MEMBERS } from '../utils/mutations';
import { QUERY_MEMBERS } from '../utils/queries';
import papa from 'papaparse';
import ErrorPage from './ErrorPage';
import getGroups from '../utils/getGroups';

// Bootstrap react components
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Figure from 'react-bootstrap/Figure';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';

// global variable representing the members in the DB
let currentMembers = [];

export default function UploadMembers() {
  // state representing new members data uploaded from user
  const [members, setMembers] = useState([]);
  // state representing member information in DB to be displayed in the table
  // (may be filtered and/or paginated version of DB membership data)
  const [display, setDisplay] = useState([]);
  // feedback to the user in an alert
  const [message, setMessage] = useState('');
  // state representing currently selected file
  const [file, setFile] = useState('');
  // summary stats of memberhip currently in DB
  const [numMembers, setNumMembers] = useState(0);
  const [numVMST, setNumVMST] = useState(0);
  const [groups, setGroups] = useState([]);
  // states for filtering the members table
  const [name, setName] = useState('');
  const [clubGroup, setClubGroup] = useState('');
  // mutation to update the Members collection in the CB
  // (used in form onSubmit event handler)
  const [upload, { error }] = useMutation(UPLOAD_MEMBERS);

  // retrieve DB membership info
  const { loading, data } = useQuery(QUERY_MEMBERS);

  // function to extract data to display in members table
  const displayMembers = (members) => {
    const displayData = members.map(member => {
      return {
        usmsRegNo: member.usmsRegNo,
        fullName: member.firstName + ' ' + member.lastName,
        club: member.club,
        usmsId: member.usmsId,
        workoutGroup: member.workoutGroup,
        regYear: member.regYear,
      };
    });
    setDisplay(displayData);
  }

  // this variable will contain the content of the DB for the function
  // initially it is set from the DB query
  currentMembers = data?.members || [];

  useEffect(() => {
    if (currentMembers.length > 0) {
      setNumMembers(currentMembers.length);
      setNumVMST(currentMembers.filter(member => member.club === 'VMST').length);
      setGroups(getGroups(currentMembers));
      displayMembers(currentMembers);
    }
  }, [data])

  // file input onchange event handler, which parses the CSV file
  const handleFile = (e) => {
    setFile(e.target.value);
    setMessage('');
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

    if (data.uploadMembers.length === 0) {
      setMessage(`There was a problem: ${error}`);
    } else {
      // update the variable representing members in DB
      currentMembers = data.uploadMembers;
      // update some state vars: members, member stats
      // these will trigger update of the member table (should that be a spearate component?)
      setNumMembers(currentMembers.length);
      setNumVMST(currentMembers.filter(member => member.club === 'VMST').length);
      setGroups(getGroups(currentMembers));

      // display the new data
      displayMembers(currentMembers);
    }

    //reset state variables
    setMembers([]);
    setFile('');
    setName('');
    setClubGroup('');
  };

  // case-insensitive search/filter for name (first or last), respecting
  // any term in the club/group search field
  // maybe eventually make the search smarter (eg space separated terms or regex)
  const handleNameChange = async (e) => {
    let filteredMembers;
    if (e.target.value.length > 0) {
      // update displayed value
      setName(e.target.value);
      const filterTerm = e.target.value.toLowerCase();
      filteredMembers = currentMembers.filter(member => {
        const fullName = [member.firstName, member.lastName].join('').toLowerCase();
        const clubAndGroup = [member.club, member.workoutGroup].join('').toLowerCase();
        return fullName.includes(filterTerm) && clubAndGroup.includes(clubGroup.toLowerCase());
      });
      displayMembers(filteredMembers);
    } else if (clubGroup) {
      setName('');
      // need to filter based on club/group search term, which is not empty
      filteredMembers = currentMembers.filter(member => {
        const clubAndGroup = [member.club, member.workoutGroup].join('').toLowerCase();
        return clubAndGroup.includes(clubGroup.toLowerCase());
      });
      displayMembers(filteredMembers);
    } else {
      // both search terms empty, reset display
      setName('');
      displayMembers(currentMembers);
    }
  }

  // case-insensitive search/filter for club or group, respecting
  // any term in the name search field
  // maybe eventually make the search smarter (eg space separated terms or regex)
  const handleGroupChange = async (e) => {
    let filteredMembers;
    if (e.target.value.length > 0) {
      // update displayed value
      setClubGroup(e.target.value);
      const filterTerm = e.target.value.toLowerCase();
      filteredMembers = currentMembers.filter(member => {
        const fullName = [member.firstName, member.lastName].join('').toLowerCase();
        const clubAndGroup = [member.club, member.workoutGroup].join('').toLowerCase();
        return clubAndGroup.includes(filterTerm) && fullName.includes(name.toLowerCase());
      });
      displayMembers(filteredMembers);
    } else if (name) {
      setClubGroup('');
      // need to filter based on name search term, which is not empty
      filteredMembers = currentMembers.filter(member => {
        const fullName = [member.firstName, member.lastName].join('').toLowerCase();
        return fullName.includes(name.toLowerCase());
      });
      displayMembers(filteredMembers);
    } else {
      // reset display and name state variable
      setClubGroup('');
      displayMembers(currentMembers);
    }
  }

  // find out role
  let role;
  Auth.loggedIn()
    ? role = Auth.getProfile().data.role
    : role = '';
  // only the membership coordinator has access to this page
  if (role !== 'membership') {
    throw new Error('Not authorized to view this page');
    return <ErrorPage />;
  }

  return (
    <>
      <Container>
        <h2 style={{marginTop:"20px", marginBottom:"20px"}}>Upload Membership Roll</h2>

        <Card style={{marginBottom:"60px"}} body>
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
        </Card>

        {/* when message is not an empty string, it is displayed */}
        {message && <Alert variant='success'> {message} </Alert>}

        <Accordion style={{marginBottom:"15px"}}>
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

        <Card style={{marginBottom:"60px"}}>
          <Card.Body>
            There are currently {numMembers} members in the LMSC, {numVMST} of whom are in VMST.
            <br />
            VMST workout groups: {groups.join(', ')}.
          </Card.Body>
        </Card>

        {/* filter the table by name or club/group */}
        <Form>
          <Row>
            <Col>
              <Form.Group controlId="filterName">
                <Form.Label>Search by name: </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First or Last Name"
                  value={name}
                  onChange={handleNameChange}
                >
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="filterGroup">
                <Form.Label>Search by club/group: </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Club or WO group"
                  value={clubGroup}
                  onChange={handleGroupChange}
                >
                </Form.Control>
              </Form.Group>
            </Col>
            {/* Would be nice to have a small "clear all" button but styling... */}
            {/* <Col> */}
            {/*   <Button variant="warning">Clear All</Button> */}
            {/* </Col> */}
          </Row>
        </Form>

        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>USMS Reg No.</th>
              <th>Club</th>
              <th>WO Group</th>
              <th>Reg Year</th>
            </tr>
          </thead>
          <tbody>
            {display?.map(member => (
              <tr key={member.usmsRegNo}>
                <td>{member.fullName}</td>
                <td>
                  <a href={`https://www.usms.org/people/${member.usmsId}`} target="_new">
                    {member.usmsRegNo}
                  </a>
                </td>
                <td>{member.club}</td>
                <td>{member.workoutGroup}</td>
                <td>{member.regYear}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

    </>
  );
};
