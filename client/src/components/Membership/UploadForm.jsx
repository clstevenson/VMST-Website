/* 
 Component to prompt user to choose a membership file to upload
 */

import styled from "styled-components";
import FileUploader from "./FileUploader";

export default function UploadForm() {
  return (
    <Form onSubmit={handleFormSubmit}>
      <FileWrapper>
        <FileUploader
          style={{ width: "160px", flex: "0 0 auto" }}
          handleFile={handleFile}
          filetype="csv"
        >
          {/* want buttons the same size */}
          Choose CSV file
        </FileUploader>
        <FileUploadInstructions>
          {file === ""
            ? "Click to upload membership file"
            : "Upload a different membership file"}
        </FileUploadInstructions>
      </FileWrapper>

      {/* After file chosen display message and update button */}
      {file && (
        <>
          <p>
            <span style={{ fontFamily: "monospace" }}>
              {file.substring(file.lastIndexOf("\\") + 1)}
            </span>{" "}
            uploaded with {members.length} members
          </p>
          <FileWrapper>
            <UpdateButton type="submit" disabled={file === ""}>
              Update members
            </UpdateButton>
            <FileUploadInstructions>
              Click to update database with uploaded file
            </FileUploadInstructions>
          </FileWrapper>
        </>
      )}
    </Form>
  );
}

const FileUploadInstructions = styled.span`
  padding: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  margin: 16px 0;
  margin-left: -4px;
`;

const UpdateButton = styled(SubmitButton)`
  display: inline-block;
  padding: 4px 8px;
  margin: 8px 0;
  flex: 0 0 auto;
  flex-basis: 160px;
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};

  &:disabled {
    background-color: ${COLORS.gray[10]};
    border: none;
  }
`;

const FileWrapper = styled.div`
  display: flex;
  align-items: center;
`;
