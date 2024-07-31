import styled from "styled-components";
import { useForm } from "react-hook-form";
import { COLORS } from "../../utils/constants";

export default function PhotosPerPage({ perPage, setPerPage, numPhotos }) {
  const { register, handleSubmit, getValues, setValue, reset } = useForm({
    defaultValues: {
      perPage: perPage,
    },
  });

  const onSubmit = ({ perPage }) => {
    setPerPage(parseInt(perPage));
  };

  return (
    <ControlForm onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          type="text"
          id="perPage"
          {...register("perPage")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = parseInt(e.target.value);
              if (value < 1) {
                setPerPage(1);
              } else if (value > numPhotos) {
                setPerPage(numPhotos);
                setValue("perPage", numPhotos);
              } else setPerPage(value);
            }
          }}
        />
        <label htmlFor="perPage">photos per page</label>
      </div>
    </ControlForm>
  );
}

const ControlForm = styled.form`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 3ch;
  margin-right: 4px;
  text-align: center;
  border: none;
  border-bottom: 1.5px solid ${COLORS.accent[12]};
  background-color: ${COLORS.accent[3]};
`;
