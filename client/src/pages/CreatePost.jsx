/* 
 Page for the form used to create a new post. Only available to leaders.


 */

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { ChevronLeft, ChevronRight } from "react-feather";

import Auth from "../utils/auth";
import {
  QUERY_FEATUREDPHOTOS,
  QUERY_ALBUMS,
  QUERY_ALBUMPHOTOS,
} from "../utils/queries";
import { ADD_POST } from "../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import SubmitButton from "../components/Styled/SubmiButton";
import ErrorMessage from "../components/Styled/ErrorMessage";

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
  const [photos, setPhotos] = useState([]);
  const [maxPages, setMaxPages] = useState();
  const [page, setPage] = useState(1);
  const [postPhoto, setPostPhoto] = useState({});

  const [getFeatured, { loading }] = useLazyQuery(QUERY_FEATUREDPHOTOS, {
    onCompleted: (data) => {
      setPhotos(data.getFeaturedPhotos.photos);
      setMaxPages(data.getFeaturedPhotos.pages);
    },
  });

  useEffect(() => {
    // only logged-in leaders can view the page
    if (!Auth.loggedIn()) navigate("/");
    const { data: userProfile } = Auth.getProfile();
    if (userProfile.role !== "leader") navigate("/");
    if (albumId === featuredId)
      getFeatured({ variables: { page, perPage: 16 } });
  }, [navigate, albumId, page, getFeatured]);

  const onSubmit = async ({ title, summary, content }) => {
    // send data to ADD_POST mutation
    try {
      const { id, url, caption, flickrURL } = postPhoto;
      const { data } = await addPost({
        variables: {
          title,
          summary,
          content,
          photo: { id, url, caption, flickrURL },
        },
      });
      // need a toast to convey success
      console.log(data);
      reset();
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
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
          {photos.map((photo) => {
            return (
              <ToggleGroupItem key={photo.id} value={photo.id} tabIndex={1}>
                <img src={photo.url} alt={photo.caption} />
              </ToggleGroupItem>
            );
          })}
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
