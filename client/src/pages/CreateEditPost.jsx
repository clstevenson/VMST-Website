/* eslint-disable react/display-name */
/* 
 Page for the form used to create or edit a new post. Only available to leaders.

 The prop determines whether or not this component is being used to creeate or edit.
 They also correspond to different routes.
 */

import styled from "styled-components";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Select from "@radix-ui/react-select";
import { ChevronLeft, ChevronRight, Check } from "react-feather";

import Auth from "../utils/auth";
import {
  QUERY_ALBUMS,
  QUERY_ALBUMPHOTOS,
  QUERY_SINGLEPOST,
} from "../utils/queries";
import { ADD_POST, EDIT_POST } from "../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import SubmitButton from "../components/Styled/SubmiButton";
import ErrorMessage from "../components/Styled/ErrorMessage";
import ToastMessage from "../components/ToastMessage";
import Spinner from "../components/Spinner";

export default function CreateEditPost({ isEditing = false }) {
  const navigate = useNavigate();
  const [addPost] = useMutation(ADD_POST);
  const [editPost] = useMutation(EDIT_POST);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // controls album (photoset) being displayed
  const featuredId = "72177720319183779";
  const [albumId, setAlbumId] = useState(featuredId);
  // array/list of all possible albums
  const [albumList, setAlbumList] = useState([]);
  // array of photos in grid
  const [photos, setPhotos] = useState([]);
  // number of pages of photos in photoset
  const [maxPages, setMaxPages] = useState();
  // current page of photos being displayed
  const [page, setPage] = useState(1);
  // photo chosen for the post (on home page)
  const [postPhoto, setPostPhoto] = useState({});
  // has the post been added to the DB?
  const [posted, setPosted] = useState(false);
  // HTML-formatted content of Quill editor
  const [postContent, setPostContent] = useState("");
  // (error) message to display under the editor
  const [message, setMessage] = useState("");

  const { postId } = useParams();

  // Quill text editor options/modules
  const modules = {
    toolbar: [
      ["bold", "italic", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ header: 1 }, { header: 2 }],
      [{ header: [1, 2, 3, 4, false] }],
      ["link", "image"],
    ],
  };

  useQuery(QUERY_ALBUMS, {
    variables: { page: 1, perPage: 500 },
    onCompleted: (data) => {
      const albums = data.getAlbums.album.map((album) => {
        const { id, caption: title } = album;
        return { id, title };
      });
      setAlbumList([...albums]);
    },
    //TODO: add error handling
  });

  const [getPhotos, { loading }] = useLazyQuery(QUERY_ALBUMPHOTOS, {
    variables: { perPage: 16 }, // always retrieve 16 photos for grid
    onCompleted: (data) => {
      setPhotos(data.getAlbumPhotos.photos);
      setMaxPages(data.getAlbumPhotos.pages);
    },
    //TODO: add error handling
  });

  const [getPost] = useLazyQuery(QUERY_SINGLEPOST, {
    onCompleted: (data) => {
      setValue("title", data.onePost.title);
      setValue("summary", data.onePost.summary);
      setPostContent(data.onePost.content);
      if (data.onePost.photo) {
        setPostPhoto(data.onePost.photo);
        setValue("caption", data.onePost.photo.caption);
      }
    },
  });

  useEffect(() => {
    // only logged-in leaders can view the page
    if (!Auth.loggedIn()) navigate("/");
    const { data: userProfile } = Auth.getProfile();
    if (userProfile.role !== "leader") navigate("/");

    // fill in the photo picker grid
    getPhotos({ variables: { albumId, page } });

    // if we are editing an existing post, fill in the current values
    if (isEditing) {
      getPost({ variables: { postId } });
    }
  }, [navigate, albumId, page, getPhotos, getPost, postId, isEditing]);

  const onSubmit = async ({ title, summary }) => {
    // make sure there is content
    if (!postContent) {
      setMessage("Content cannot be empty.");
      return;
    }
    // send data to ADD_POST mutation
    try {
      if (Object.keys(postPhoto).length !== 0) {
        // photo was selected
        const { id, url, flickrURL } = postPhoto;
        const caption = getValues("caption");
        if (isEditing) {
          await editPost({
            variables: {
              id: postId,
              title,
              summary,
              content: postContent,
              photo: { id, url, caption, flickrURL },
            },
          });
        } else {
          await addPost({
            variables: {
              title,
              summary,
              content: postContent,
              photo: { id, url, caption, flickrURL },
            },
          });
        }
      } else {
        if (isEditing) {
          // need to explicitly set photo ID to null in case it was removed
          const photo = {
            // even without a photo, these are required fields or GraphQL throws an error
            id: "",
            url: "",
            flickrURL: "",
          };
          await editPost({
            variables: {
              id: postId,
              title,
              summary,
              content: postContent,
              photo,
            },
          });
        } else {
          await addPost({
            variables: { title, summary, content: postContent },
          });
        }
      }

      // need a toast to convey success; its CB function will cleanup
      setPosted(true);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  };

  // function called after Toast display closes
  const cleanup = () => {
    // reset the form and set states to initial values
    reset();
    setMessage("");
    setPosted(false);
    setPostContent("");
    setPostPhoto({});

    // go back to previous page in history
    /*
      TODO: write Apollo memory cache to reflect the added post
      Using react-router displays stale data, unfortunately; Apollo's cache isn't updated
      look into using SWR or react-query, and then use "navigate" (react-router)
      rather than location (ie, refresh which forces a re-fetch)
      */
    // navigate(-1);

    // for the time being, force a (time-consuming) refresh and refetch
    const backURL = isEditing ? `/post/${postId}` : "/";
    location = backURL;
  };

  const nextPage = () => {
    if (page === maxPages) return;
    setPage(page + 1);
  };

  const lastPage = () => {
    if (page === 1) return;
    setPage(page - 1);
  };

  return (
    <FormWrapper aria-label="create new post" onSubmit={handleSubmit(onSubmit)}>
      <TextWrapper>
        {/* contains text input forms for title, summary, content */}
        <InputWrapper>
          <label htmlFor="title">Title (required)</label>
          <input
            type="text"
            id="title"
            placeholder="Enter title here"
            {...register("title", {
              required: "Title is required",
            })}
          />
          {errors.title?.message && (
            <ErrorMessage>{errors.title.message}</ErrorMessage>
          )}
        </InputWrapper>
        <InputWrapper>
          <label htmlFor="summary">Summary (optional)</label>
          <input type="text" id="summary" {...register("summary")} />
          <Description>
            One teaser sentence to display on the front page. If left blank, the
            beginning of the content will be shown.
          </Description>
        </InputWrapper>

        <QuillWrapper>
          <label htmlFor="content">Content (required)</label>
          <ReactQuill
            id="content"
            theme="snow"
            placeholder="Enter post content here"
            modules={modules}
            value={postContent}
            onChange={setPostContent}
          />
        </QuillWrapper>
        <Description style={{ marginTop: "-18px" }}>
          If you use images, please choose small sizes to avoid database bloat.
          The image will float left (text flowing to the right of the image) in
          the final post; eventually this will be under user control.
        </Description>
        {/* error message to display */}
        {message && <ErrorMessage>{message}</ErrorMessage>}
      </TextWrapper>

      <PhotoWrapper>
        <h3>
          Click to choose post photo{" "}
          <span style={{ fontWeight: "normal" }}>
            (optional but recommended)
          </span>
        </h3>

        <PhotoNav>
          <SelectWrapper>
            <Select.Root
              defaultValue={albumId}
              value={albumId}
              onValueChange={(val) => {
                setAlbumId(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <Select.Value placeholder="Photo album..." />
                <Select.Icon />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectViewport>
                  <SelectItem value={featuredId}>
                    <Select.ItemText>Featured photos</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={18} />
                    </Select.ItemIndicator>
                  </SelectItem>
                  {albumList.map((album) => {
                    return (
                      <SelectItem key={album.id} value={album.id}>
                        <Select.ItemText>{album.title}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check size={18} />
                        </Select.ItemIndicator>
                      </SelectItem>
                    );
                  })}
                </SelectViewport>
              </SelectContent>
            </Select.Root>
          </SelectWrapper>
          <ChevronWrapper>
            <PhotoNavButton
              type="button"
              disabled={page === 1}
              onClick={lastPage}
            >
              <ChevronLeft />
            </PhotoNavButton>
            <span>
              Page {page} of {maxPages}
            </span>
            <PhotoNavButton
              type="button"
              disabled={page === maxPages}
              onClick={nextPage}
            >
              <ChevronRight />
            </PhotoNavButton>
          </ChevronWrapper>
        </PhotoNav>

        <TogglePhotoGrid
          type="single"
          value={postPhoto.id}
          onValueChange={(value) => {
            if (value) {
              const photo = photos.filter((photo) => photo.id === value)[0];
              setPostPhoto(photo);
              setValue("caption", photo.caption);
            } else {
              setPostPhoto({});
              setValue("caption", "");
            }
          }}
        >
          {loading ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            photos.map((photo) => {
              return (
                <ToggleGroupItem key={photo.id} value={photo.id} tabIndex={1}>
                  <img src={photo.url} alt={photo.caption} />
                </ToggleGroupItem>
              );
            })
          )}
        </TogglePhotoGrid>
        {postPhoto.url && (
          <>
            <a
              href={postPhoto.flickrURL}
              target="_new"
              style={{
                margin: "6px 0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ChosenPhoto src={postPhoto.url} alt={postPhoto.caption} />
            </a>
            <PhotoDescription>
              click photo for download options
            </PhotoDescription>
          </>
        )}
        <InputWrapper>
          <label htmlFor="caption">Photo caption</label>
          <input type="text" id="caption" {...register("caption")} />
        </InputWrapper>
      </PhotoWrapper>
      <SubmitWrapper>
        <Button
          type="button"
          onClick={() => {
            reset();
            navigate(-1);
          }}
        >
          Close
        </Button>
        <SubmitButton style={{ minWidth: "var(--btn-width)" }} type="submit">
          {isSubmitting ? "working..." : isEditing ? "Save" : "Post"}
        </SubmitButton>
      </SubmitWrapper>
      {posted && (
        <ToastMessage toastCloseEffect={cleanup} duration={1500}>
          Success! Your new post is live.
        </ToastMessage>
      )}
    </FormWrapper>
  );
}

const FormWrapper = styled.form`
  /* common min width of all buttons */
  --btn-width: 12ch;
  --label-size: 1.1rem;
  display: grid;
  grid-template-columns:
    minmax(200px, 1fr)
    minmax(400px, 1fr);
  grid-template-areas:
    "content photo"
    "button button";
  gap: 24px;
  margin: 32px 0;
  background-color: ${COLORS.accent[3]};
  border: 1px solid ${COLORS.accent[12]};
  padding: 16px;
  border-radius: 8px;
  box-shadow: 2px 4px 8px ${COLORS.gray[10]};
  width: 100%;

  & label {
    font-size: var(--label-size);
    font-style: italic;
  }

  @media (max-width: 1200px) {
    grid-template-columns: minmax(350px, 1fr);
    grid-template-areas:
      "content"
      "photo"
      "button";
  }
`;

const TogglePhotoGrid = styled(ToggleGroup.Root)`
  display: grid;
  grid-template-columns: repeat(4, minmax(125px, 1fr));
  grid-template-rows: repeat(4, minmax(125px, 1fr));
  width: 100%;
  height: 550px;
  margin-bottom: 8px;
  gap: 4px;
  position: relative;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 4px;
  }

  @media (max-width: 550px) {
    grid-template-columns: repeat(4, minmax(100px, 1fr));
    grid-template-rows: repeat(4, minmax(100px, 1fr));
    height: 450px;
  }
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ToggleGroupItem = styled(ToggleGroup.Item)`
  &[data-state="on"] {
    outline: 1px solid black;
    background-color: ${COLORS.accent[2]};
    box-shadow: 2px 4px 8px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  & input {
    padding: 4px;
  }
`;

const TextWrapper = styled.div`
  grid-area: content;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: none;
`;

const PhotoWrapper = styled.div`
  grid-area: photo;
  min-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  gap: 8px;

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
`;

const Button = styled.button`
  display: inline-block;
  text-align: center;
  min-width: var(--btn-width);
  padding: 4px 8px;
  background-color: ${COLORS.accent[12]};
  color: white;
  border-radius: 4px;
  font-weight: ${WEIGHTS.medium};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.accent[10]};
  }
`;

const SubmitWrapper = styled.div`
  grid-area: button;
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 48px;
`;

const Description = styled.p`
  font-size: 0.8rem;
`;

const PhotoDescription = styled(Description)`
  margin: 0 auto;
  margin-top: -16px;
`;

const ChosenPhoto = styled.img`
  width: min(80%, 400px);
  max-width: 100%;
  min-height: 300px;
  object-fit: cover;
  border: 1px solid black;
  box-shadow: 2px 4px 8px black;
  margin-bottom: 8px;
`;

const PhotoNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectWrapper = styled.div``;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const PhotoNavButton = styled.button`
  all: unset;
  padding: 4px;
  line-height: 1;
  border-radius: 50%;

  &:hover:not(:disabled) {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
    outline: auto;
    transform: scale(1.2);
  }

  &:disabled {
    color: ${COLORS.gray[9]};
  }

  & svg {
    width: 28px;
    height: 28px;
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  width: 35ch;
  display: inline-flex;
  justify-content: space-between;
  margin-right: 6px;
  padding-left: 8px;
`;

const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  z-index: 99;
  width: var(--radix-select-trigger-width);
  height: var(--radix-select-content-available-height);
`;

const SelectViewport = styled(Select.Viewport)``;

const SelectItem = styled(Select.Item)`
  width: var(--radix-select-trigger-width);
  padding-left: 8px;
  margin: 8px 0;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

// Used to style the contents of the Quill editor
const QuillWrapper = styled.div`
  padding: 0;

  & * {
    background-color: white;
  }

  & label {
    background-color: revert;
  }

  & p {
    font-size: 1rem;
  }
`;
