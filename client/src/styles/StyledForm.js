import styled from 'styled-components';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;

  input {
    margin: 5px 0;
    width: 50%;
    padding: 10px;
    border-radius: var(--border-radius-pill);
    border: none;
  }

  textarea {
    margin: 5px 0;
    font-size: 15px;
    max-width: 50%;
    min-width: 50%;
    padding: 25px 10px 10px 10px;
    border-radius: var(--border-radius-pill);
    border: none;

  }

  button {
    margin: 5px 0;
    background-color: gray;
    width: 50%;
  }
`;

export default StyledForm;
