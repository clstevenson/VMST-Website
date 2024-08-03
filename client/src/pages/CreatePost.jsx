/* eslint-disable react/display-name */
/* 
 Page for the form used to create a new post. Only available to leaders.


 */

import styled from "styled-components";
import { useEffect, useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Select from "@radix-ui/react-select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
} from "react-feather";

import Auth from "../utils/auth";
import { QUERY_ALBUMS, QUERY_ALBUMPHOTOS } from "../utils/queries";
import { ADD_POST } from "../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import SubmitButton from "../components/Styled/SubmiButton";
import ErrorMessage from "../components/Styled/ErrorMessage";
import ToastMessage from "../components/ToastMessage";
import Spinner from "../components/Spinner";

export default function CreatePost() {
  const navigate = useNavigate();
  const [addPost] = useMutation(ADD_POST);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const featuredId = "72177720319183779";
  const [albumId, setAlbumId] = useState(featuredId);
  const [albumList, setAlbumList] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [maxPages, setMaxPages] = useState();
  const [page, setPage] = useState(1);
  const [postPhoto, setPostPhoto] = useState({});
  const [posted, setPosted] = useState(false);

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

  useEffect(() => {
    // only logged-in leaders can view the page
    if (!Auth.loggedIn()) navigate("/");
    const { data: userProfile } = Auth.getProfile();
    if (userProfile.role !== "leader") navigate("/");
    getPhotos({ variables: { albumId, page } });
  }, [navigate, albumId, page, getPhotos]);

  const onSubmit = async ({ title, summary, content }) => {
    // send data to ADD_POST mutation
    try {
      const { id, url, flickrURL } = postPhoto;
      if (id) {
        // photo was selected
        const caption = getValues("caption");
        const { data } = await addPost({
          variables: {
            title,
            summary,
            content,
            photo: { id, url, caption, flickrURL },
          },
        });
      } else {
        const { data } = await addPost({
          variables: {
            title,
            summary,
            content,
          },
        });
      }
      // need a toast to convey success; its CB function will cleanup
      setPosted(true);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  };

  const cleanup = () => {
    // called after Toast displays
    reset();
    /*
      using react-router displays stale data, unfortunately.
      look into using SWR or react-query, and then use "navigate" (react-router)
      rather than location (ie, refresh)
      */
    // navigate("/");
    location = "/";
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

        <InputWrapper>
          <label htmlFor="content">Content (required)</label>
          <textarea
            name="content"
            id="content"
            rows={15}
            {...register("content", {
              required: "You must write something to post.",
            })}
          ></textarea>
          {errors.content?.message && (
            <ErrorMessage>{errors.content.message}</ErrorMessage>
          )}
        </InputWrapper>
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
                  </SelectItem>
                  {albumList.map((album) => {
                    return (
                      <SelectItem key={album.id} value={album.id}>
                        <Select.ItemText>{album.title}</Select.ItemText>
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
            console.log(value);
            if (value) {
              const photo = photos.filter((photo) => photo.id === value)[0];
              setPostPhoto(photo);
              setValue("caption", photo.caption);
              console.log(photo.url);
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
            // navigate("/");
            location = "/";
          }}
        >
          Close
        </Button>
        <SubmitButton style={{ minWidth: "var(--btn-width)" }} type="submit">
          {isSubmitting ? "posting..." : "Post"}
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
    font-size: 1.1rem;
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
