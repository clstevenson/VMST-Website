/* eslint-disable react/display-name */
/* 
 Page for the form used to create or edit a new post. Only available to leaders.

 The prop determines whether or not this component is being used to creeate or edit.
 They also correspond to different routes.
 */

import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Select from "@radix-ui/react-select";
import { ChevronLeft, ChevronRight, Check } from "react-feather";
import { SquareX, Archive, SaveCheck, BookPlus } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  QUERY_ALBUMS,
  QUERY_ALBUMPHOTOS,
  QUERY_SINGLEPOST,
} from "../utils/queries";
import { ADD_POST, EDIT_POST } from "../utils/mutations";
import { COLORS, QUERIES } from "../utils/constants";
import ErrorMessage from "../components/Styled/ErrorMessage";
import ToastMessage from "../components/ToastMessage";
import Spinner from "../components/Spinner";
import Editor from "../components/Editor";

export default function CreateEditPost({ isEditing = false }) {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isLeader = user?.role === "leader";
  const [addPost] = useMutation(ADD_POST);
  const [editPost] = useMutation(EDIT_POST);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
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
  // the editor is uncontrolled and only reads postContent once, at mount;
  // when editing, postContent loads asynchronously, so the editor must not
  // mount until that initial content has arrived
  const [contentReady, setContentReady] = useState(!isEditing);
  // description shown under the Cancel/Save/Post icon row on hover/focus
  const [actionStatus, setActionStatus] = useState("");
  // baseline values captured when editing an existing post, so the Save
  // button can stay disabled until something actually changes
  const originalContentRef = useRef("");
  const originalPhotoIdRef = useRef("");
  // whether the post being edited is currently a draft (only relevant
  // when isEditing; unused -- and irrelevant -- when creating)
  const [postIsDraft, setPostIsDraft] = useState(false);
  // which action (Save vs Post) the user clicked, read by onSubmit; both
  // buttons are type="submit" on the same form, so this is set just before
  // the submit fires rather than tracked via two separate handlers
  const publishOnSubmitRef = useRef(true);

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
      // reset (rather than setValue) establishes these as the form's
      // baseline, so formState.isDirty only flips once the user actually
      // changes something instead of as soon as the async load lands
      reset({
        title: data.onePost.title,
        summary: data.onePost.summary,
        caption: data.onePost.photo?.caption ?? "",
      });
      setPostContent(data.onePost.content);
      originalContentRef.current = data.onePost.content;
      setContentReady(true);
      setPostPhoto(data.onePost.photo ?? {});
      originalPhotoIdRef.current = data.onePost.photo?.id ?? "";
      setPostIsDraft(!data.onePost.posted);
    },
  });

  // only logged-in leaders can view the page; wait for the auth check
  // (including a possible silent token refresh) to settle first
  useEffect(() => {
    if (!isLoading && !isLeader) navigate("/");
  }, [isLoading, isLeader, navigate]);

  useEffect(() => {
    if (isLoading || !isLeader) return;

    // fill in the photo picker grid
    getPhotos({ variables: { albumId, page } });

    // if we are editing an existing post, fill in the current values
    if (isEditing) {
      getPost({ variables: { postId } });
    }
  }, [
    isLoading,
    isLeader,
    albumId,
    page,
    getPhotos,
    getPost,
    postId,
    isEditing,
  ]);

  // when editing, there's no need to save (or run a mutation) until
  // something has actually changed from what was loaded
  const contentChanged = postContent !== originalContentRef.current;
  const photoChanged = (postPhoto.id ?? "") !== originalPhotoIdRef.current;
  const hasUnsavedChanges = isDirty || contentChanged || photoChanged;
  const saveDisabled = isEditing && !hasUnsavedChanges;
  // true whenever there's a separate "Post" action available (creating a
  // new post, or editing one that's still a draft) -- in that case "Save"
  // means "stay a draft," otherwise "Save" means "save the published post"
  const canPublish = !isEditing || postIsDraft;

  const onSubmit = async ({ title, summary }) => {
    // renamed from "posted" locally to avoid colliding with the
    // posted/setPosted state below, which means something unrelated
    // (whether the just-submitted save succeeded, for the toast)
    const shouldPost = publishOnSubmitRef.current;
    // publishing a draft is always meaningful, even with no other edits;
    // otherwise respect the no-unsaved-changes guard as before
    const isPublishingDraft = isEditing && postIsDraft && shouldPost;
    if (saveDisabled && !isPublishingDraft) return;
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
              posted: shouldPost,
            },
          });
        } else {
          await addPost({
            variables: {
              title,
              summary,
              content: postContent,
              photo: { id, url, caption, flickrURL },
              posted: shouldPost,
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
              posted: shouldPost,
            },
          });
        } else {
          await addPost({
            variables: { title, summary, content: postContent, posted: shouldPost },
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

  // still resolving the session, or about to redirect away
  if (isLoading || !isLeader) return null;

  return (
    <FormWrapper
      aria-label="create/edit new post"
      onSubmit={handleSubmit(onSubmit)}
    >
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
          {contentReady && (
            <Editor
              id="content"
              placeholder="Enter post content here"
              modules={modules}
              defaultValue={postContent}
              onTextChange={setPostContent}
            />
          )}
        </QuillWrapper>
        <QuillDescription>
          Check out{" "}
          <a href="https://www.flickr.com/photos/va_swims/" target="_new">
            our Flickr account
          </a>{" "}
          for images to use. If you use images, please choose small sizes (eg{" "}
          <span>Small240</span> or <span>Small320</span>) to reduce database
          bloat. The image will float left (text flowing to the right of the
          image) in the final post.
        </QuillDescription>
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
              <SelectTrigger tabIndex={1}>
                <Select.Value />
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
              setValue("caption", photo.caption, { shouldDirty: true });
            } else {
              setPostPhoto({});
              setValue("caption", "", { shouldDirty: true });
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
        <ActionRow>
          <IconButton
            type="button"
            onMouseEnter={() =>
              setActionStatus(
                isEditing ? "Do not save changes" : "Do not post",
              )
            }
            onFocus={() =>
              setActionStatus(
                isEditing ? "Do not save changes" : "Do not post",
              )
            }
            onMouseLeave={() => setActionStatus("")}
            onBlur={() => setActionStatus("")}
            onClick={() => {
              reset();
              navigate(-1);
            }}
          >
            <SquareX /> Cancel
          </IconButton>
          <IconButton
            type="submit"
            $disabled={saveDisabled}
            aria-disabled={saveDisabled ? "true" : undefined}
            onMouseEnter={() =>
              setActionStatus(
                saveDisabled
                  ? "No changes to save"
                  : canPublish
                    ? "Save as draft post"
                    : "Save changes to post",
              )
            }
            onFocus={() =>
              setActionStatus(
                saveDisabled
                  ? "No changes to save"
                  : canPublish
                    ? "Save as draft post"
                    : "Save changes to post",
              )
            }
            onMouseLeave={() => setActionStatus("")}
            onBlur={() => setActionStatus("")}
            onClick={(event) => {
              publishOnSubmitRef.current = !canPublish;
              if (saveDisabled) event.preventDefault();
            }}
          >
            {canPublish ? <Archive /> : <SaveCheck />}
            {isSubmitting && !publishOnSubmitRef.current ? "working..." : "Save"}
          </IconButton>
          {canPublish && (
            <IconButton
              type="submit"
              onMouseEnter={() =>
                setActionStatus(
                  isEditing ? "Publish this draft" : "Create blog post",
                )
              }
              onFocus={() =>
                setActionStatus(
                  isEditing ? "Publish this draft" : "Create blog post",
                )
              }
              onMouseLeave={() => setActionStatus("")}
              onBlur={() => setActionStatus("")}
              onClick={() => {
                publishOnSubmitRef.current = true;
              }}
            >
              <BookPlus />
              {isSubmitting && publishOnSubmitRef.current
                ? "working..."
                : "Post"}
            </IconButton>
          )}
        </ActionRow>
        <StatusLine>{actionStatus}</StatusLine>
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
    grid-template-columns: minmax(0, 1fr);
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
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

  @media ${QUERIES.mobile} {
    min-width: 300px;
  }
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

const SubmitWrapper = styled.div`
  grid-area: button;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
`;

const IconButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;
  border: none;
  padding: 4px 8px;
  line-height: 1;
  color: ${COLORS.accent[12]};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  & svg {
    width: 48px;
    height: 48px;
    stroke-width: 1.5;
    padding: 8px;
  }

  &:hover {
    transform: scale(1.1);
    color: ${COLORS.accent[9]};
    cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  }
  &:hover svg {
    stroke-width: 2;
  }
`;

// reserves a line of height so hover/focus descriptions don't shift layout
const StatusLine = styled.p`
  height: 1.2em;
  margin-top: 4px;
  font-size: 0.9rem;
  font-style: italic;
  color: ${COLORS.accent[11]};
`;

const Description = styled.p`
  font-size: 0.8rem;
`;

const QuillDescription = styled(Description)`
  margin-top: -18px;
  font-size: 0.95rem;

  & span {
    font-family: monospace;
  }
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
  gap: 8px;

  @media ${QUERIES.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SelectWrapper = styled.div`
  min-width: 0;
  flex: 1;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;

  @media ${QUERIES.mobile} {
    margin-left: 0;
    justify-content: center;
  }
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
  max-width: 100%;
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
    font-size: 1.05rem;
  }
`;
