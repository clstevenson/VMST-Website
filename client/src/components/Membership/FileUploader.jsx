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
import { COLORS, WEIGHTS } from "../../utils/constants";

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

const Button = styled.button`
  /* Reset OS-specfic / browser-specific default style (see https://ishadeed.com/article/styling-the-good-old-button/#the-default-styles) */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: ${COLORS.accent[2]};
  border: 1px solid ${COLORS.accent[12]};
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
  padding: 4px 12px;
  /* Make the button easy for touchscreen users to tap */
  min-height: 44px;
  min-width: 44px;
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};
  font-weight: ${WEIGHTS.medium};

  &:hover,
  &:focus {
    outline: auto;
    transform: scale(1.05);
  }
`;

export default FileUploader;
