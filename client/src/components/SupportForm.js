import React, { useState } from 'react';
import SectionWrapper from './SectionWrapper';
import { StyledForm } from '../styles';
import axios from 'axios';

const SupportForm = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const BACKEND_URI = process.env.NODE_ENV !== 'production' ? 'http://localhost:2222/support' : 'https://gbm-spotify.herokuapp.com/support';
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `${BACKEND_URI}`;
    axios.post(url, {
      subject: subject,
      message: message,
    });
    setSubject('');
    setMessage('');
  };

  return (
    <main>
      <SectionWrapper>
        <StyledForm method='POST' onSubmit={handleSubmit}>
          <input placeholder='Subject' onChange={(e) => setSubject(e.target.value)} value={subject} />
          <textarea placeholder='Message' onChange={(e) => setMessage(e.target.value)} value={message} />
          <button>Submit Ticket</button>
        </StyledForm>
      </SectionWrapper>
    </main>
  );
};

export default SupportForm;
