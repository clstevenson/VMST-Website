/* eslint-disable react/prop-types */
/* 
 A styled file-upload component. The input field (type "file") is hidden, instead a button is used to trigger the upload.

 Input props:
 - handleFile is the CB function for what to do with the file. At the very least there should be a message stating what file was uploaded.
 - filetype is the (optional) file extension to upload
 - children is the text displayed in the button
 
 Any inline styles applied to the component (in calling it) are passed to the button

 Adapted from: 
 https://medium.com/web-dev-survey-from-kyoto/how-to-customize-the-file-upload-button-in-react-b3866a5973d8
 */

import { useRef } from "react";
import styled from "styled-components";
import MinorButton from "./Styled/MinorButton";

const FileUploader = ({
  handleFile,
  filetype = "",
  children,
  ...delegated
}) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // account for the fact that the filetype prop might not have the required dot
  if (!filetype.includes(".") && filetype !== "") filetype = "." + filetype;

  return (
    <>
      {/* activate ("click") the hidden file input element when the Button is clicked */}
      <Button
        style={delegated.style}
        type="button"
        onClick={() => hiddenFileInput.current.click()}
      >
        {children}
      </Button>
      <input
        type="file"
        onChange={handleFile}
        ref={hiddenFileInput}
        accept={filetype}
        style={{ display: "none" }} // Make the file input element invisible
      />
    </>
  );
};

const Button = styled(MinorButton)`
  padding: 4px 12px;
  min-height: 44px;
  min-width: 44px;
`;

export default FileUploader;
