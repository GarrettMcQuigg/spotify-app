import React from 'react';
import { SectionWrapper, SupportForm } from '../components';

const Support = () => {
  return (
    <main>
      <SectionWrapper title='Create a Support Ticket' breadcrumb={true}>
        <SupportForm />
      </SectionWrapper>
    </main>
  );
};

export default Support;
